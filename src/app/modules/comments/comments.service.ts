import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/app/entities/comment.entity';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import { FilterCommentDto } from './dto/filter-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
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
}
