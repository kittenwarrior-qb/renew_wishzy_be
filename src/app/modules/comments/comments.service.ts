import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/app/entities/comment.entity';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import { FilterCommentDto } from './dto/filter-comment.dto';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly coursesService: CoursesService,
  ) {}
  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId: createCommentDto.courseId },
    });
    if (!enrollment) {
      throw new BadRequestException(
        `Cannot create comment for user ${userId} and course ${createCommentDto.courseId}`,
      );
    }
    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId,
      like: 0,
      dislike: 0,
    });
    const savedComment = await this.commentRepository.save(comment);

    // Update course average rating
    await this.updateCourseAverageRating(createCommentDto.courseId);

    return savedComment;
  }

  async findAll(filter: FilterCommentDto): Promise<PaginationResponse<Comment>> {
    const { page, limit, courseId } = filter;
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (courseId) {
      queryBuilder.where('comment.courseId = :courseId', { courseId });
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

  async findByCourse(
    courseId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResponse<Comment>> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.courseId = :courseId', { courseId })
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

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

  async findOne(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
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
    const courseId = comment.courseId;
    Object.assign(comment, updateCommentDto);
    const savedComment = await this.commentRepository.save(comment);

    // Update course average rating if rating changed
    if (updateCommentDto.rating !== undefined) {
      await this.updateCourseAverageRating(courseId);
    }

    return savedComment;
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
    const courseId = comment.courseId;
    await this.commentRepository.remove(comment);

    // Update course average rating after deletion
    await this.updateCourseAverageRating(courseId);
  }

  /**
   * Calculate and update the average rating for a course
   */
  private async updateCourseAverageRating(courseId: string): Promise<void> {
    const result = await this.commentRepository
      .createQueryBuilder('comment')
      .select('AVG(comment.rating)', 'avgRating')
      .where('comment.courseId = :courseId', { courseId })
      .getRawOne();

    const averageRating = result?.avgRating ? parseFloat(result.avgRating) : 0;
    await this.coursesService.updateAverageRating(courseId, averageRating);
  }
}
