import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Put } from '@nestjs/common';
import { CommentBlogService } from './comment-blog.service';
import { CreateCommentBlogDto, UpdateCommentBlogDto, FilterCommentBlogDto } from './dto/comment-blog.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { Public } from '../../modules/auth/decorators/public.decorator';

@ApiTags('Blog Comments')
@Controller('comment-blogs')
export class CommentBlogController {
    constructor(private readonly commentBlogService: CommentBlogService) { }

    @Post()
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'Create a blog comment' })
    create(@Body() createDto: CreateCommentBlogDto, @CurrentUser() user: User) {
        return this.commentBlogService.create(createDto, user.id);
    }

    @Get('blog/:blogId')
    @Public()
    @ApiOperation({ summary: 'Get comments for a blog' })
    findByBlog(@Param('blogId') blogId: string, @Query() filter: FilterCommentBlogDto) {
        return this.commentBlogService.findByBlog(blogId, filter);
    }

    @Put(':id')
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'Update comment' })
    update(@Param('id') id: string, @Body() updateDto: UpdateCommentBlogDto, @CurrentUser() user: User) {
        return this.commentBlogService.update(id, updateDto, user.id);
    }

    @Delete(':id')
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'Delete comment' })
    remove(@Param('id') id: string, @CurrentUser() user: User) {
        return this.commentBlogService.remove(id, user.id);
    }

    @Patch(':id/like')
    @Public() // Or guarded
    @ApiOperation({ summary: 'Like comment' })
    like(@Param('id') id: string) {
        return this.commentBlogService.toggleLike(id);
    }
}
