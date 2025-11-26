import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/app/entities/comment.entity';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Enrollment]), CoursesModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
