import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryBlogController } from './category-blog.controller';
import { CategoryBlogService } from './category-blog.service';
import { CategoryBlog } from 'src/app/entities/category-blog.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CategoryBlog])],
    controllers: [CategoryBlogController],
    providers: [CategoryBlogService],
    exports: [CategoryBlogService],
})
export class CategoryBlogModule { }
