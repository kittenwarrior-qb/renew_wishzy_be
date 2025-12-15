import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorEnrollmentsController } from './instructor-enrollments.controller';
import { InstructorEnrollmentsService } from './instructor-enrollments.service';
import { Enrollment } from '../../entities/enrollment.entity';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      Course,
      User,
    ]),
  ],
  controllers: [InstructorEnrollmentsController],
  providers: [InstructorEnrollmentsService],
  exports: [InstructorEnrollmentsService],
})
export class InstructorModule {}
