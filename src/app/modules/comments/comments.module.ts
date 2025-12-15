import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/app/entities/comment.entity';
import { Lecture } from 'src/app/entities/lecture.entity';
import { Course } from 'src/app/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Lecture, Course])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
