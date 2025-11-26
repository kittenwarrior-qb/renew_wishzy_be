import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lecture } from 'src/app/entities/lecture.entity';
import { Chapter } from 'src/app/entities/chapter.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LecturesService {
  constructor(
    @InjectRepository(Lecture) private readonly lectureRepository: Repository<Lecture>,
    @InjectRepository(Chapter) private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async create(createLectureDto: CreateLectureDto, userId: string): Promise<Lecture> {
    const chapter = await this.chapterRepository.findOne({
      where: { id: createLectureDto.chapterId },
    });
    if (!chapter) {
      throw new BadRequestException(`Chapter with ID ${createLectureDto.chapterId} not found`);
    }

    const lecture = this.lectureRepository.create({ ...createLectureDto, createdBy: userId });
    const savedLecture = await this.lectureRepository.save(lecture);

    // Update chapter and course durations after creation
    await this.updateChapterDuration(createLectureDto.chapterId);

    return savedLecture;
  }

  async findAllLectureOfChapter(chapterId: string): Promise<Lecture[]> {
    const lectures = await this.lectureRepository.find({ where: { chapterId } });

    const validateLecture = lectures.map((lecture) => {
      if (!lecture.isPreview) {
        delete lecture.fileUrl;
      }

      return lecture;
    });

    return validateLecture;
  }

  async findOne(id: string): Promise<Lecture> {
    const lecture = await this.lectureRepository.findOne({ where: { id } });
    if (!lecture) {
      throw new BadRequestException(`Lecture with ID ${id} not found`);
    }
    return lecture;
  }

  async update(id: string, updateLectureDto: UpdateLectureDto): Promise<Lecture> {
    const lecture = await this.findOne(id);
    const oldDuration = lecture.duration;
    Object.assign(lecture, updateLectureDto);
    const savedLecture = await this.lectureRepository.save(lecture);

    // If duration changed, update chapter and course durations
    if (updateLectureDto.duration !== undefined && updateLectureDto.duration !== oldDuration) {
      await this.updateChapterDuration(lecture.chapterId);
    }

    return savedLecture;
  }

  async remove(id: string): Promise<void> {
    const lecture = await this.findOne(id);
    const chapterId = lecture.chapterId;
    await this.lectureRepository.softDelete(lecture);

    // Update chapter and course durations after deletion
    await this.updateChapterDuration(chapterId);
  }

  async updateVideoSources(
    id: string,
    videoSources: Record<string, string>,
    videoDuration?: number,
  ): Promise<Lecture> {
    const lecture = await this.findOne(id);
    lecture.videoSources = videoSources;

    // If video duration is provided, update it (this is the real duration from video)
    if (videoDuration !== undefined && videoDuration > 0) {
      lecture.duration = videoDuration;
    }

    const savedLecture = await this.lectureRepository.save(lecture);

    // Update chapter duration after lecture duration changes
    await this.updateChapterDuration(lecture.chapterId);

    return savedLecture;
  }

  /**
   * Calculate and update chapter duration based on all its lectures
   */
  private async updateChapterDuration(chapterId: string): Promise<void> {
    const lectures = await this.lectureRepository.find({
      where: { chapterId },
    });

    const totalDuration = lectures.reduce((sum, lecture) => sum + (lecture.duration || 0), 0);

    await this.chapterRepository.update(chapterId, {
      duration: totalDuration,
    });

    // Get chapter to find courseId and update course duration
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
    });

    if (chapter) {
      await this.updateCourseDuration(chapter.courseId);
    }
  }

  /**
   * Calculate and update course duration based on all its chapters
   */
  private async updateCourseDuration(courseId: string): Promise<void> {
    const chapters = await this.chapterRepository.find({
      where: { courseId },
    });

    const totalDuration = chapters.reduce((sum, chapter) => sum + (chapter.duration || 0), 0);

    // Update course total duration
    await this.chapterRepository.manager.query(
      `UPDATE courses SET total_duration = $1 WHERE id = $2`,
      [totalDuration, courseId],
    );
  }
}
