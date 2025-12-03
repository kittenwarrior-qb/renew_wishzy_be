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

    // Use transaction to ensure atomicity
    const queryRunner = this.lectureRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Auto set orderIndex if not provided
      let orderIndex = createLectureDto.orderIndex;
      if (orderIndex === undefined || orderIndex === null) {
        const maxOrderIndex = await queryRunner.manager
          .createQueryBuilder(Lecture, 'lecture')
          .select('MAX(lecture.orderIndex)', 'max')
          .where('lecture.chapterId = :chapterId', { chapterId: createLectureDto.chapterId })
          .getRawOne();

        orderIndex = (maxOrderIndex?.max ?? -1) + 1;
      } else {
        // If orderIndex is provided, shift existing lectures with orderIndex >= new orderIndex
        await queryRunner.manager
          .createQueryBuilder()
          .update(Lecture)
          .set({ orderIndex: () => 'order_index + 1' })
          .where('chapterId = :chapterId', { chapterId: createLectureDto.chapterId })
          .andWhere('orderIndex >= :orderIndex', { orderIndex })
          .execute();
      }

      const lecture = queryRunner.manager.create(Lecture, {
        ...createLectureDto,
        orderIndex,
        createdBy: userId,
      });

      const savedLecture = await queryRunner.manager.save(lecture);
      await queryRunner.commitTransaction();

      // Update chapter and course durations after creation
      await this.updateChapterDuration(createLectureDto.chapterId);

      return savedLecture;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllLectureOfChapter(chapterId: string): Promise<Lecture[]> {
    const lectures = await this.lectureRepository.find({
      where: { chapterId },
      order: { orderIndex: 'ASC' }, // Sort by orderIndex only
    });

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
    const oldOrderIndex = lecture.orderIndex;
    const newOrderIndex = updateLectureDto.orderIndex;

    // If orderIndex is being changed, reorder other lectures
    if (newOrderIndex !== undefined && newOrderIndex !== oldOrderIndex) {
      if (newOrderIndex > oldOrderIndex) {
        // Moving down: decrease orderIndex of items between old and new position
        await this.lectureRepository
          .createQueryBuilder()
          .update(Lecture)
          .set({ orderIndex: () => 'order_index - 1' })
          .where('chapterId = :chapterId', { chapterId: lecture.chapterId })
          .andWhere('orderIndex > :oldOrderIndex', { oldOrderIndex })
          .andWhere('orderIndex <= :newOrderIndex', { newOrderIndex })
          .execute();
      } else {
        // Moving up: increase orderIndex of items between new and old position
        await this.lectureRepository
          .createQueryBuilder()
          .update(Lecture)
          .set({ orderIndex: () => 'order_index + 1' })
          .where('chapterId = :chapterId', { chapterId: lecture.chapterId })
          .andWhere('orderIndex >= :newOrderIndex', { newOrderIndex })
          .andWhere('orderIndex < :oldOrderIndex', { oldOrderIndex })
          .execute();
      }
    }

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
    await this.lectureRepository.remove(lecture);

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
