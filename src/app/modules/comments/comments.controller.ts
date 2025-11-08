import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { FilterCommentDto } from './dto/filter-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/app/entities/user.entity';

@Controller('comments')
@ApiBearerAuth('bearer')
@ApiTags('Comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Public()
  async create(@Body() createCommentDto: CreateCommentDto, @CurrentUser() user: User) {
    const comment = await this.commentsService.create(createCommentDto, user.id);
    return {
      message: 'Comment created successfully',
      ...comment,
    };
  }

  @Get()
  @Public()
  async findAll(@Query() filterDto: FilterCommentDto) {
    const comments = await this.commentsService.findAll(filterDto);
    return {
      message: 'Comments retrieved successfully',
      ...comments,
    };
  }

  @Get(':commentId')
  @Public()
  async findOne(@Param('commentId') commentId: string) {
    const comment = await this.commentsService.findOne(commentId);
    return {
      message: 'Comment retrieved successfully',
      ...comment,
    };
  }

  @Put(':commentId')
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
  async like(@Param('commentId') commentId: string) {
    await this.commentsService.like(commentId);
    return {
      message: 'Comment liked successfully',
    };
  }

  @Patch(':commentId/dislike')
  async dislike(@Param('commentId') commentId: string) {
    await this.commentsService.dislike(commentId);
    return {
      message: 'Comment disliked successfully',
    };
  }
}
