import { Controller, Get, Post, Body, Patch, Param, Query, Put, Delete } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilterFeedbackDto } from './dto/filter-feedback.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';

@Controller('feedbacks')
@ApiBearerAuth('bearer')
@ApiTags('Feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new feedback',
    description: 'Create a new feedback for a course. Requires authentication and enrollment.',
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback created successfully',
    schema: {
      example: {
        message: 'Feedback created successfully',
        id: 'uuid',
        content: 'Great course!',
        rating: 5,
        userId: 'uuid',
        courseId: 'uuid',
        like: 0,
        dislike: 0,
        createdAt: '2025-11-14T10:00:00.000Z',
        updatedAt: '2025-11-14T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  async create(@Body() createFeedbackDto: CreateFeedbackDto, @CurrentUser() user: User) {
    const feedback = await this.feedbacksService.create(createFeedbackDto, user.id);
    return {
      message: 'Feedback created successfully',
      ...feedback,
    };
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all feedbacks',
    description: 'Retrieve a paginated list of feedbacks with optional filters (courseId)',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedbacks retrieved successfully',
    schema: {
      example: {
        message: 'Feedbacks retrieved successfully',
        items: [
          {
            id: 'uuid',
            content: 'Great course!',
            rating: 5,
            like: 5,
            dislike: 0,
            userId: 'uuid',
            courseId: 'uuid',
            createdAt: '2025-11-14T10:00:00.000Z',
            updatedAt: '2025-11-14T10:00:00.000Z',
            user: {
              id: 'uuid',
              fullName: 'John Doe',
              avatar: 'url',
            },
          },
        ],
        pagination: {
          totalPage: 10,
          totalItems: 100,
          currentPage: 1,
          itemsPerPage: 10,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid filter parameters' })
  async findAll(@Query() filterDto: FilterFeedbackDto) {
    const feedbacks = await this.feedbacksService.findAll(filterDto);
    return {
      message: 'Feedbacks retrieved successfully',
      ...feedbacks,
    };
  }

  @Get(':feedbackId')
  @Public()
  @ApiOperation({
    summary: 'Get a feedback by ID',
    description: 'Retrieve detailed information about a specific feedback',
  })
  @ApiParam({
    name: 'feedbackId',
    description: 'The unique identifier of the feedback',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback retrieved successfully',
    schema: {
      example: {
        message: 'Feedback retrieved successfully',
        id: 'uuid',
        content: 'Great course!',
        rating: 5,
        like: 5,
        dislike: 0,
        userId: 'uuid',
        courseId: 'uuid',
        createdAt: '2025-11-14T10:00:00.000Z',
        updatedAt: '2025-11-14T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(@Param('feedbackId') feedbackId: string) {
    const feedback = await this.feedbacksService.findOne(feedbackId);
    return {
      message: 'Feedback retrieved successfully',
      ...feedback,
    };
  }

  @Put(':feedbackId')
  @ApiOperation({
    summary: 'Update a feedback',
    description: 'Update the content of an existing feedback. Only the feedback owner can update it.',
  })
  @ApiParam({
    name: 'feedbackId',
    description: 'The unique identifier of the feedback to update',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback updated successfully',
    schema: {
      example: {
        message: 'Feedback updated successfully',
        id: 'uuid',
        content: 'Updated feedback content',
        rating: 4,
        like: 5,
        dislike: 0,
        userId: 'uuid',
        courseId: 'uuid',
        createdAt: '2025-11-14T10:00:00.000Z',
        updatedAt: '2025-11-14T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the feedback owner' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async update(
    @Param('feedbackId') feedbackId: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @CurrentUser() user: User,
  ) {
    const feedback = await this.feedbacksService.update(feedbackId, updateFeedbackDto, user.id);
    return {
      message: 'Feedback updated successfully',
      ...feedback,
    };
  }

  @Patch(':feedbackId/like')
  @ApiOperation({
    summary: 'Like a feedback',
    description: 'Increment the like count for a specific feedback.',
  })
  @ApiParam({
    name: 'feedbackId',
    description: 'The unique identifier of the feedback to like',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback liked successfully',
    schema: {
      example: {
        message: 'Feedback liked successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async like(@Param('feedbackId') feedbackId: string) {
    await this.feedbacksService.like(feedbackId);
    return {
      message: 'Feedback liked successfully',
    };
  }

  @Patch(':feedbackId/dislike')
  @ApiOperation({
    summary: 'Dislike a feedback',
    description: 'Increment the dislike count for a specific feedback.',
  })
  @ApiParam({
    name: 'feedbackId',
    description: 'The unique identifier of the feedback to dislike',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback disliked successfully',
    schema: {
      example: {
        message: 'Feedback disliked successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async dislike(@Param('feedbackId') feedbackId: string) {
    await this.feedbacksService.dislike(feedbackId);
    return {
      message: 'Feedback disliked successfully',
    };
  }

  @Delete(':feedbackId')
  @ApiOperation({
    summary: 'Delete a feedback',
    description: 'Delete a feedback. Only the feedback owner can delete it.',
  })
  @ApiParam({
    name: 'feedbackId',
    description: 'The unique identifier of the feedback to delete',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback deleted successfully',
    schema: {
      example: {
        message: 'Feedback deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the feedback owner' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async remove(@Param('feedbackId') feedbackId: string, @CurrentUser() user: User) {
    await this.feedbacksService.remove(feedbackId, user.id);
    return {
      message: 'Feedback deleted successfully',
    };
  }

  @Get('instructor/my-courses')
  @Roles(UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Get all feedbacks for instructor courses',
    description: 'Retrieve a paginated list of all feedbacks from the instructor\'s courses.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: String,
    description: 'Filter by specific course ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructor feedbacks retrieved successfully',
    schema: {
      example: {
        message: 'Instructor feedbacks retrieved successfully',
        items: [
          {
            id: 'uuid',
            content: 'Great course!',
            rating: 5,
            like: 10,
            dislike: 0,
            userId: 'uuid',
            courseId: 'uuid',
            createdAt: '2025-11-14T10:00:00.000Z',
            updatedAt: '2025-11-14T10:00:00.000Z',
            user: {
              id: 'uuid',
              fullName: 'John Doe',
              avatar: 'url',
            },
            course: {
              id: 'uuid',
              name: 'Course Name',
            },
          },
        ],
        pagination: {
          totalPage: 10,
          totalItems: 100,
          currentPage: 1,
          itemsPerPage: 10,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an instructor' })
  async getInstructorFeedbacks(
    @CurrentUser() user: User,
    @Query() filterDto: FilterFeedbackDto,
  ) {
    const result = await this.feedbacksService.findByInstructorCourses(
      user.id,
      filterDto.page,
      filterDto.limit,
      filterDto.courseId,
    );
    return {
      message: 'Instructor feedbacks retrieved successfully',
      ...result,
    };
  }

  @Get('course/:courseId')
  @Public()
  @ApiOperation({
    summary: 'Get all feedbacks for a course',
    description: 'Retrieve a paginated list of all feedbacks for a specific course.',
  })
  @ApiParam({
    name: 'courseId',
    description: 'The unique identifier of the course',
    example: 'uuid-string',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Course feedbacks retrieved successfully',
    schema: {
      example: {
        message: 'Course feedbacks retrieved successfully',
        items: [
          {
            id: 'uuid',
            content: 'Great course!',
            rating: 5,
            like: 10,
            dislike: 0,
            userId: 'uuid',
            courseId: 'uuid',
            createdAt: '2025-11-14T10:00:00.000Z',
            updatedAt: '2025-11-14T10:00:00.000Z',
            user: {
              id: 'uuid',
              fullName: 'John Doe',
              avatar: 'url',
            },
          },
        ],
        pagination: {
          totalPage: 10,
          totalItems: 100,
          currentPage: 1,
          itemsPerPage: 10,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid course ID' })
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.feedbacksService.findByCourse(courseId, Number(page), Number(limit));
    return {
      message: 'Course feedbacks retrieved successfully',
      ...result,
    };
  }
}
