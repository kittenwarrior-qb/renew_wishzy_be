import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from 'src/app/entities/feedback.entity';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import { FilterFeedbackDto } from './dto/filter-feedback.dto';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
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

  async findAll(filter: FilterFeedbackDto): Promise<PaginationResponse<Feedback>> {
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

  async findByCourse(
    courseId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResponse<Feedback>> {
    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .leftJoinAndSelect('feedback.course', 'course')
      .where('feedback.courseId = :courseId', { courseId })
      .orderBy('feedback.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

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

  async like(feedbackId: string): Promise<void> {
    const feedback = await this.findOne(feedbackId);
    feedback.like += 1;
    await this.feedbackRepository.save(feedback);
  }

  async dislike(feedbackId: string): Promise<void> {
    const feedback = await this.findOne(feedbackId);
    feedback.dislike += 1;
    await this.feedbackRepository.save(feedback);
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
}
