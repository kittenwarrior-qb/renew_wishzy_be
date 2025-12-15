import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReplyCommentDto } from './dto/reply-comment.dto';
import { UpdateCommentStatusDto } from './dto/update-comment-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentStatus } from 'src/app/entities/comment.entity';
import { Lecture } from 'src/app/entities/lecture.entity';
import { Course } from 'src/app/entities/course.entity';
import { User, UserRole } from 'src/app/entities/user.entity';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import { FilterCommentDto } from './dto/filter-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId,
      like: 0,
      dislike: 0,
    });
    return await this.commentRepository.save(comment);
  }

  async findAll(filter: FilterCommentDto): Promise<PaginationResponse<Comment>> {
    const { page = 1, limit = 10, lectureId } = filter;
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.parentId IS NULL') // Only get top-level comments
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (lectureId) {
      queryBuilder.andWhere('comment.lectureId = :lectureId', { lectureId });
    }

    const [comments, total] = await queryBuilder.getManyAndCount();

    return {
      items: comments,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findByLecture(
    lectureId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResponse<Comment>> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.lectureId = :lectureId', { lectureId })
      .andWhere('comment.parentId IS NULL') // Only get top-level comments
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [comments, total] = await queryBuilder.getManyAndCount();

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this.commentRepository
          .createQueryBuilder('reply')
          .leftJoinAndSelect('reply.user', 'user')
          .where('reply.parentId = :parentId', { parentId: comment.id })
          .orderBy('reply.createdAt', 'ASC')
          .getMany();
        return { ...comment, replies };
      }),
    );

    return {
      items: commentsWithReplies as any,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ 
      where: { id: commentId },
      relations: ['user'],
    });
    if (!comment) {
      throw new BadRequestException(`Comment with ID ${commentId} not found`);
    }
    return comment;
  }

  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.findOne(commentId);
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comment');
    }
    Object.assign(comment, { content: updateCommentDto.content });
    return await this.commentRepository.save(comment);
  }

  async like(commentId: string): Promise<void> {
    const comment = await this.findOne(commentId);
    comment.like += 1;
    await this.commentRepository.save(comment);
  }

  async dislike(commentId: string): Promise<void> {
    const comment = await this.findOne(commentId);
    comment.dislike += 1;
    await this.commentRepository.save(comment);
  }

  async remove(commentId: string, userId: string): Promise<void> {
    const comment = await this.findOne(commentId);
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comment');
    }
    await this.commentRepository.remove(comment);
  }

  async getReplies(commentId: string): Promise<Comment[]> {
    return await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.parentId = :commentId', { commentId })
      .orderBy('comment.createdAt', 'ASC')
      .getMany();
  }

  /**
   * Get all comments from instructor's courses (or all comments if user is admin)
   */
  async findInstructorComments(
    userId: string,
    userRole: UserRole,
    filter: FilterCommentDto,
  ): Promise<PaginationResponse<any>> {
    const { page = 1, limit = 10, lectureId } = filter;



    // Build query to find comments
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoin('comment.lecture', 'lecture')
      .leftJoin('chapters', 'chapter', 'chapter.id = lecture.chapter_id')
      .leftJoin('courses', 'course', 'course.id = chapter.course_id')
      .addSelect(['lecture.id', 'lecture.name', 'course.id', 'course.name'])
      .andWhere('comment.parentId IS NULL'); // Only top-level comments

    // If user is ADMIN, show all comments. If INSTRUCTOR, only show their courses' comments
    if (userRole === UserRole.ADMIN) {
      // No additional filtering for admin - they see all comments
    } else {
      queryBuilder.andWhere('course.created_by = :userId', { userId });
    }

    if (lectureId) {
      queryBuilder.andWhere('comment.lectureId = :lectureId', { lectureId });
    }

    queryBuilder.orderBy('comment.createdAt', 'DESC');

    const total = await queryBuilder.getCount();

    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const comments = await queryBuilder.getMany();

    // Get replies count for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this.getReplies(comment.id);
        return {
          ...comment,
          repliesCount: replies.length,
        };
      }),
    );

    // Calculate statistics
    const allCommentsQuery = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.lecture', 'lecture')
      .leftJoin('chapters', 'chapter', 'chapter.id = lecture.chapter_id')
      .leftJoin('courses', 'course', 'course.id = chapter.course_id');

    // Apply same role-based filtering for statistics
    if (userRole === UserRole.ADMIN) {
      // Admin sees all comments - no additional filtering
    } else {
      allCommentsQuery.where('course.created_by = :userId', { userId });
    }

    const allComments = await allCommentsQuery.getMany();

    const statistics = {
      totalComments: allComments.length,
      pendingComments: allComments.filter((c) => c.status === CommentStatus.PENDING).length,
      repliedComments: allComments.filter((c) => c.status === CommentStatus.REPLIED).length,
      resolvedComments: allComments.filter((c) => c.status === CommentStatus.RESOLVED).length,
    };

    return {
      items: commentsWithReplies,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
      statistics,
    };
  }

  /**
   * Reply to a comment (creates a child comment)
   */
  async replyToComment(
    commentId: string,
    userId: string,
    userRole: UserRole,
    replyDto: ReplyCommentDto,
  ): Promise<Comment> {
    // Find parent comment
    const parentComment = await this.findOne(commentId);

    // Admin can reply to any comment, instructor can only reply to their course comments
    if (userRole !== UserRole.ADMIN) {
      // Verify instructor owns the course
      const lecture = await this.lectureRepository
        .createQueryBuilder('lecture')
        .leftJoin('chapters', 'chapter', 'chapter.id = lecture.chapter_id')
        .leftJoin('courses', 'course', 'course.id = chapter.course_id')
        .where('lecture.id = :lectureId', { lectureId: parentComment.lectureId })
        .andWhere('course.created_by = :userId', { userId })
        .getOne();

      if (!lecture) {
        throw new ForbiddenException('You can only reply to comments on your own courses');
      }
    }

    // Create reply comment
    const reply = this.commentRepository.create({
      content: replyDto.content,
      userId: userId,
      lectureId: parentComment.lectureId,
      parentId: commentId,
      like: 0,
      dislike: 0,
    });

    const savedReply = await this.commentRepository.save(reply);

    // Update parent comment status to REPLIED if it was PENDING
    if (parentComment.status === CommentStatus.PENDING) {
      parentComment.status = CommentStatus.REPLIED;
      await this.commentRepository.save(parentComment);
    }

    return savedReply;
  }

  /**
   * Update comment status
   */
  async updateCommentStatus(
    commentId: string,
    userId: string,
    userRole: UserRole,
    statusDto: UpdateCommentStatusDto,
  ): Promise<Comment> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.lecture', 'lecture')
      .leftJoin('chapters', 'chapter', 'chapter.id = lecture.chapter_id')
      .leftJoin('courses', 'course', 'course.id = chapter.course_id')
      .where('comment.id = :commentId', { commentId });

    // Admin can update any comment, instructor can only update their course comments
    if (userRole !== UserRole.ADMIN) {
      queryBuilder.andWhere('course.created_by = :userId', { userId });
    }

    const comment = await queryBuilder.getOne();

    if (!comment) {
      throw new BadRequestException('Comment not found or you do not have permission');
    }

    comment.status = statusDto.status;
    return await this.commentRepository.save(comment);
  }
}
