import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from 'src/app/entities/chapter.entity';
import { Course } from 'src/app/entities/course.entity';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { ChapterOwnershipGuard } from './guards/chapter-ownership.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter, Course, Enrollment])],
  controllers: [ChaptersController],
  providers: [ChaptersService, ChapterOwnershipGuard],
})
export class ChaptersModule {}
