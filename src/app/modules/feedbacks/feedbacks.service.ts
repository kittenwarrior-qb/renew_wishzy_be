import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from 'src/app/entities/feedback.entity';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { FeedbackReaction, ReactionType } from 'src/app/entities/feedback-reaction.entity';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import { FilterFeedbackDto } from './dto/filter-feedback.dto';
import { CoursesService } from '../courses/courses.service';

// Extended feedback type with user reaction info
export interface FeedbackWithReaction extends Feedback {
  userReaction?: ReactionType | null;
}

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(FeedbackReaction)
    private readonly reactionRepository: Repository<FeedbackReaction>,
    private readonly coursesService: CoursesService,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto, userId: string): Promise<Feedback> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId: createFeedbackDto.courseId },
    });
    if (!enrollment) {
      throw new BadRequestException(
        `Cannot create feedback for user ${userId} and course ${createFeedbackDto.courseId}`,
      );
    }
    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      userId,
      like: 0,
      dislike: 0,
    });
    const savedFeedback = await this.feedbackRepository.save(feedback);

    // Update course average rating
    await this.updateCourseAverageRating(createFeedbackDto.courseId);

    return savedFeedback;
  }

  async findAll(filter: FilterFeedbackDto, userId?: string): Promise<PaginationResponse<FeedbackWithReaction>> {
    const { page, limit, courseId } = filter;
    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .leftJoinAndSelect('feedback.course', 'course')
      .orderBy('feedback.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (courseId) {
      queryBuilder.where('feedback.courseId = :courseId', { courseId });
    }

    const [feedbacks, total] = await queryBuilder.getManyAndCount();

    // Add user reactions if userId provided
    const feedbacksWithReactions = await this.addUserReactions(feedbacks, userId);

    return {
      items: feedbacksWithReactions,
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
    userId?: string,
  ): Promise<PaginationResponse<FeedbackWithReaction>> {
    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .leftJoinAndSelect('feedback.course', 'course')
      .where('feedback.courseId = :courseId', { courseId })
      .orderBy('feedback.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [feedbacks, total] = await queryBuilder.getManyAndCount();

    // Add user reactions if userId provided
    const feedbacksWithReactions = await this.addUserReactions(feedbacks, userId);

    return {
      items: feedbacksWithReactions,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(feedbackId: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({ 
      where: { id: feedbackId },
      relations: ['user', 'course'],
    });
    if (!feedback) {
      throw new BadRequestException(`Feedback with ID ${feedbackId} not found`);
    }
    return feedback;
  }

  async update(
    feedbackId: string,
    updateFeedbackDto: UpdateFeedbackDto,
    userId: string,
  ): Promise<Feedback> {
    const feedback = await this.findOne(feedbackId);
    if (feedback.userId !== userId) {
      throw new ForbiddenException('You can only edit your own feedback');
    }
    const courseId = feedback.courseId;
    Object.assign(feedback, updateFeedbackDto);
    const savedFeedback = await this.feedbackRepository.save(feedback);

    // Update course average rating if rating changed
    if (updateFeedbackDto.rating !== undefined) {
      await this.updateCourseAverageRating(courseId);
    }

    return savedFeedback;
  }

  /**
   * Like a feedback (with user tracking)
   * - If user hasn't reacted: add like
   * - If user already liked: remove like (toggle off)
   * - If user already disliked: switch to like
   */
  async like(feedbackId: string, userId: string): Promise<{ action: 'added' | 'removed' | 'switched'; userReaction: ReactionType | null }> {
    const feedback = await this.findOne(feedbackId);
    
    // Check existing reaction
    const existingReaction = await this.reactionRepository.findOne({
      where: { feedbackId, userId },
    });

    if (!existingReaction) {
      // No reaction yet - add like
      await this.reactionRepository.save({
        feedbackId,
        userId,
        type: ReactionType.LIKE,
      });
      feedback.like += 1;
      await this.feedbackRepository.save(feedback);
      return { action: 'added', userReaction: ReactionType.LIKE };
    }

    if (existingReaction.type === ReactionType.LIKE) {
      // Already liked - toggle off (remove like)
      await this.reactionRepository.remove(existingReaction);
      feedback.like = Math.max(0, feedback.like - 1);
      await this.feedbackRepository.save(feedback);
      return { action: 'removed', userReaction: null };
    }

    // Was dislike - switch to like
    existingReaction.type = ReactionType.LIKE;
    await this.reactionRepository.save(existingReaction);
    feedback.like += 1;
    feedback.dislike = Math.max(0, feedback.dislike - 1);
    await this.feedbackRepository.save(feedback);
    return { action: 'switched', userReaction: ReactionType.LIKE };
  }

  /**
   * Dislike a feedback (with user tracking)
   * - If user hasn't reacted: add dislike
   * - If user already disliked: remove dislike (toggle off)
   * - If user already liked: switch to dislike
   */
  async dislike(feedbackId: string, userId: string): Promise<{ action: 'added' | 'removed' | 'switched'; userReaction: ReactionType | null }> {
    const feedback = await this.findOne(feedbackId);
    
    // Check existing reaction
    const existingReaction = await this.reactionRepository.findOne({
      where: { feedbackId, userId },
    });

    if (!existingReaction) {
      // No reaction yet - add dislike
      await this.reactionRepository.save({
        feedbackId,
        userId,
        type: ReactionType.DISLIKE,
      });
      feedback.dislike += 1;
      await this.feedbackRepository.save(feedback);
      return { action: 'added', userReaction: ReactionType.DISLIKE };
    }

    if (existingReaction.type === ReactionType.DISLIKE) {
      // Already disliked - toggle off (remove dislike)
      await this.reactionRepository.remove(existingReaction);
      feedback.dislike = Math.max(0, feedback.dislike - 1);
      await this.feedbackRepository.save(feedback);
      return { action: 'removed', userReaction: null };
    }

    // Was like - switch to dislike
    existingReaction.type = ReactionType.DISLIKE;
    await this.reactionRepository.save(existingReaction);
    feedback.dislike += 1;
    feedback.like = Math.max(0, feedback.like - 1);
    await this.feedbackRepository.save(feedback);
    return { action: 'switched', userReaction: ReactionType.DISLIKE };
  }

  /**
   * Get user's reaction for a specific feedback
   */
  async getUserReaction(feedbackId: string, userId: string): Promise<ReactionType | null> {
    const reaction = await this.reactionRepository.findOne({
      where: { feedbackId, userId },
    });
    return reaction?.type || null;
  }

  async remove(feedbackId: string, userId: string): Promise<void> {
    const feedback = await this.findOne(feedbackId);
    if (feedback.userId !== userId) {
      throw new ForbiddenException('You can only delete your own feedback');
    }
    const courseId = feedback.courseId;
    await this.feedbackRepository.remove(feedback);

    // Update course average rating after deletion
    await this.updateCourseAverageRating(courseId);
  }

  async findByInstructorCourses(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
    courseId?: string,
  ): Promise<PaginationResponse<Feedback>> {
    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .leftJoinAndSelect('feedback.course', 'course')
      .where('course.createdBy = :instructorId', { instructorId })
      .orderBy('feedback.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (courseId) {
      queryBuilder.andWhere('feedback.courseId = :courseId', { courseId });
    }

    const [feedbacks, total] = await queryBuilder.getManyAndCount();

    return {
      items: feedbacks,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Calculate and update the average rating for a course
   */
  private async updateCourseAverageRating(courseId: string): Promise<void> {
    const result = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'avgRating')
      .where('feedback.courseId = :courseId', { courseId })
      .getRawOne();

    const averageRating = result?.avgRating ? parseFloat(result.avgRating) : 0;
    await this.coursesService.updateAverageRating(courseId, averageRating);
  }

  /**
   * Add user reactions to feedbacks array
   */
  private async addUserReactions(feedbacks: Feedback[], userId?: string): Promise<FeedbackWithReaction[]> {
    if (!userId || feedbacks.length === 0) {
      return feedbacks.map(f => ({ ...f, userReaction: null }));
    }

    const feedbackIds = feedbacks.map(f => f.id);
    const reactions = await this.reactionRepository
      .createQueryBuilder('reaction')
      .where('reaction.feedbackId IN (:...feedbackIds)', { feedbackIds })
      .andWhere('reaction.userId = :userId', { userId })
      .getMany();

    const reactionMap = new Map(reactions.map(r => [r.feedbackId, r.type]));

    return feedbacks.map(f => ({
      ...f,
      userReaction: reactionMap.get(f.id) || null,
    }));
  }
}
