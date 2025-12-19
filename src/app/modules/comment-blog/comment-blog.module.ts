import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentBlogController } from './comment-blog.controller';
import { CommentBlogService } from './comment-blog.service';
import { CommentBlog } from 'src/app/entities/comment-blog.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CommentBlog])],
    controllers: [CommentBlogController],
    providers: [CommentBlogService],
    exports: [CommentBlogService],
})
export class CommentBlogModule { }
