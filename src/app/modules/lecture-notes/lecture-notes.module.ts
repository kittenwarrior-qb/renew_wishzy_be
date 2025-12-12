import { Module } from '@nestjs/common';
import { LectureNotesService } from './lecture-notes.service';
import { LectureNotesController } from './lecture-notes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureNote } from 'src/app/entities/lecture-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LectureNote])],
  controllers: [LectureNotesController],
  providers: [LectureNotesService],
})
export class LectureNotesModule {}
