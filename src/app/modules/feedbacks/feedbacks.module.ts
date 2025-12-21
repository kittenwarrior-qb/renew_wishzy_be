import { Module } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { FeedbacksController } from './feedbacks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from 'src/app/entities/feedback.entity';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { FeedbackReaction } from 'src/app/entities/feedback-reaction.entity';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, Enrollment, FeedbackReaction]), CoursesModule],
  controllers: [FeedbacksController],
  providers: [FeedbacksService],
})
export class FeedbacksModule {}
