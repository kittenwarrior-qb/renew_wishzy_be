import { Controller, Get, Post, Body, Patch, Param, Query, Put, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReplyCommentDto } from './dto/reply-comment.dto';
import { UpdateCommentStatusDto } from './dto/update-comment-status.dto';
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
import { FilterCommentDto } from './dto/filter-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';

@Controller('comments')
@ApiBearerAuth('bearer')
@ApiTags('Comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new comment',
    description: 'Create a new comment on a lecture. Supports replies via parentId.',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  async create(@Body() createCommentDto: CreateCommentDto, @CurrentUser() user: User) {
    const comment = await this.commentsService.create(createCommentDto, user.id);
    return {
      message: 'Comment created successfully',
      ...comment,
    };
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all comments',
    description: 'Retrieve a paginated list of comments with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
  })
  async findAll(@Query() filterDto: FilterCommentDto) {
    const comments = await this.commentsService.findAll(filterDto);
    return {
      message: 'Comments retrieved successfully',
      ...comments,
    };
  }

  @Get(':commentId')
  @Public()
  @ApiOperation({
    summary: 'Get a comment by ID',
    description: 'Retrieve detailed information about a specific comment',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('commentId') commentId: string) {
    const comment = await this.commentsService.findOne(commentId);
    return {
      message: 'Comment retrieved successfully',
      ...comment,
    };
  }

  @Get(':commentId/replies')
  @Public()
  @ApiOperation({
    summary: 'Get replies to a comment',
    description: 'Retrieve all replies to a specific comment',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the parent comment',
  })
  @ApiResponse({
    status: 200,
    description: 'Replies retrieved successfully',
  })
  async getReplies(@Param('commentId') commentId: string) {
    const replies = await this.commentsService.getReplies(commentId);
    return {
      message: 'Replies retrieved successfully',
      items: replies,
    };
  }

  @Put(':commentId')
  @ApiOperation({
    summary: 'Update a comment',
    description: 'Update the content of an existing comment. Only the comment owner can update it.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the comment owner' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async update(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.update(commentId, updateCommentDto, user.id);
    return {
      message: 'Comment updated successfully',
      ...comment,
    };
  }

  @Patch(':commentId/like')
  @ApiOperation({
    summary: 'Like a comment',
    description: 'Increment the like count for a specific comment.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment to like',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment liked successfully',
  })
  async like(@Param('commentId') commentId: string) {
    await this.commentsService.like(commentId);
    return {
      message: 'Comment liked successfully',
    };
  }

  @Patch(':commentId/dislike')
  @ApiOperation({
    summary: 'Dislike a comment',
    description: 'Increment the dislike count for a specific comment.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment to dislike',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment disliked successfully',
  })
  async dislike(@Param('commentId') commentId: string) {
    await this.commentsService.dislike(commentId);
    return {
      message: 'Comment disliked successfully',
    };
  }

  @Delete(':commentId')
  @ApiOperation({
    summary: 'Delete a comment',
    description: 'Delete a comment. Only the comment owner can delete it.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the comment owner' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(@Param('commentId') commentId: string, @CurrentUser() user: User) {
    await this.commentsService.remove(commentId, user.id);
    return {
      message: 'Comment deleted successfully',
    };
  }

  @Get('lecture/:lectureId')
  @Public()
  @ApiOperation({
    summary: 'Get all comments for a lecture',
    description: 'Retrieve a paginated list of all comments for a specific lecture, including replies.',
  })
  @ApiParam({
    name: 'lectureId',
    description: 'The unique identifier of the lecture',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lecture comments retrieved successfully',
  })
  async findByLecture(
    @Param('lectureId') lectureId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.commentsService.findByLecture(lectureId, Number(page), Number(limit));
    return {
      message: 'Lecture comments retrieved successfully',
      ...result,
    };
  }

  @Get('instructor/my-courses')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all comments for instructor courses (or all comments for admin)',
    description: 'Retrieve a paginated list of all comments from the instructor\'s courses. Admin users see all comments.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @ApiQuery({
    name: 'lectureId',
    required: false,
    type: String,
    description: 'Filter by specific lecture ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructor comments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an instructor or admin' })
  async getInstructorComments(
    @CurrentUser() user: User,
    @Query() filterDto: FilterCommentDto,
  ) {
    const result = await this.commentsService.findInstructorComments(user.id, user.role, filterDto);
    return {
      message: 'Comments retrieved successfully',
      ...result,
    };
  }

  @Post(':commentId/reply')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Reply to a comment',
    description: 'Create a reply to a comment. Instructors can reply to comments on their courses, admins can reply to any comment.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment to reply to',
  })
  @ApiResponse({
    status: 201,
    description: 'Reply created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to reply to this comment' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async replyToComment(
    @Param('commentId') commentId: string,
    @Body() replyDto: ReplyCommentDto,
    @CurrentUser() user: User,
  ) {
    const reply = await this.commentsService.replyToComment(commentId, user.id, user.role, replyDto);
    return {
      message: 'Reply created successfully',
      ...reply,
    };
  }

  @Patch(':commentId/status')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update comment status',
    description: 'Update the status of a comment. Instructors can update status of comments on their courses, admins can update any comment.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to update this comment' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async updateCommentStatus(
    @Param('commentId') commentId: string,
    @Body() statusDto: UpdateCommentStatusDto,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.updateCommentStatus(commentId, user.id, user.role, statusDto);
    return {
      message: 'Comment status updated successfully',
      ...comment,
    };
  }
}
