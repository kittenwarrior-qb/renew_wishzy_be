import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/app/entities/comment.entity';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import { FilterCommentDto } from './dto/filter-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
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
    const comment = this.commentRepository.create({ ...createCommentDto, userId });
    return await this.commentRepository.save(comment);
  }

  async findAll(filter: FilterCommentDto): Promise<PaginationResponse<Comment>> {
    const { page, limit } = filter;
    const queryBuilder = this.commentRepository.createQueryBuilder('comment');
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
    Object.assign(comment, updateCommentDto);
    return this.commentRepository.save(comment);
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
}
