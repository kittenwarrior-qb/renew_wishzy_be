import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { Lecture } from 'src/app/entities/lecture.entity';
import { Chapter } from 'src/app/entities/chapter.entity';
import { Course } from 'src/app/entities/course.entity';
import { User } from 'src/app/entities/user.entity';
import { CertificateService } from './certificate.service';
import { MailModule } from '../mail/mail.module';
import { CloudinaryService } from '../uploads/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, Lecture, Chapter, Course, User]), MailModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, CertificateService, CloudinaryService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
