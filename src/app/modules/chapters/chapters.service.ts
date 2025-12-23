import { BadRequestException, Injectable, ForbiddenException } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from 'src/app/entities/chapter.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/app/entities/course.entity';
import { Enrollment } from 'src/app/entities/enrollment.entity';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter) private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(Course) private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment) private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  private async validateCourse(courseId: string): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new BadRequestException(`Course with ID ${courseId} not found`);
    }
  }

  async create(createChapterDto: CreateChapterDto, userId: string): Promise<Chapter> {
    await this.validateCourse(createChapterDto.courseId);

    // Use transaction to ensure atomicity
    const queryRunner = this.chapterRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Auto set orderIndex if not provided
      let orderIndex = createChapterDto.orderIndex;
      if (orderIndex === undefined || orderIndex === null) {
        const maxOrderIndex = await queryRunner.manager
          .createQueryBuilder(Chapter, 'chapter')
          .select('MAX(chapter.orderIndex)', 'max')
          .where('chapter.courseId = :courseId', { courseId: createChapterDto.courseId })
          .getRawOne();

        orderIndex = (maxOrderIndex?.max ?? -1) + 1;
      } else {
        // If orderIndex is provided, shift existing chapters with orderIndex >= new orderIndex
        console.log(
          `[Chapter Create] Shifting chapters with orderIndex >= ${orderIndex} in course ${createChapterDto.courseId}`,
        );
        const updateResult = await queryRunner.manager
          .createQueryBuilder()
          .update(Chapter)
          .set({ orderIndex: () => 'order_index + 1' })
          .where('courseId = :courseId', { courseId: createChapterDto.courseId })
          .andWhere('orderIndex >= :orderIndex', { orderIndex })
          .execute();
        console.log(`[Chapter Create] Updated ${updateResult.affected} chapters`);
      }

      const chapter = queryRunner.manager.create(Chapter, {
        ...createChapterDto,
        orderIndex,
        createdBy: userId,
      });

      const savedChapter = await queryRunner.manager.save(chapter);
      await queryRunner.commitTransaction();

      return savedChapter;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllChapterOfCourse(courseId: string): Promise<Chapter[]> {
    const chapters = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.course', 'course')
      .leftJoin(
        'lectures',
        'lecture',
        'lecture.chapter_id = chapter.id AND lecture.deleted_at IS NULL',
      )
      .leftJoin(
        'quizzes',
        'quiz',
        'quiz.entity_id = lecture.id',
      )
      .select(['chapter', 'course.id', 'course.name'])
      .addSelect('lecture.id', 'lecture_id')
      .addSelect('lecture.name', 'lecture_name')
      .addSelect('lecture.duration', 'lecture_duration')
      .addSelect('lecture.is_preview', 'lecture_is_preview')
      .addSelect('lecture.order_index', 'lecture_order_index')
      .addSelect('lecture.file_url', 'lecture_file_url')
      .addSelect('lecture.requires_quiz', 'lecture_requires_quiz')
      .addSelect('quiz.id', 'quiz_id')
      .addSelect('quiz.title', 'quiz_title')
      .addSelect('quiz.creator_id', 'quiz_creator_id')
      .where('chapter.course_id = :courseId', { courseId })
      .getRawAndEntities();

    const result = chapters.entities
      .map((chapter) => {
        const lecturesForChapter = chapters.raw
          .filter((raw) => raw.chapter_id === chapter.id && raw.lecture_id !== null)
          .reduce((acc, raw) => {
            const existingLecture = acc.find(l => l.id === raw.lecture_id);
            
            if (existingLecture) {
              // Add quiz to existing lecture if not already added
              if (raw.quiz_id && !existingLecture.quizzes.some(q => q.id === raw.quiz_id)) {
                existingLecture.quizzes.push({
                  id: raw.quiz_id,
                  title: raw.quiz_title,
                  creatorId: raw.quiz_creator_id,
                });
              }
            } else {
              // Create new lecture with quiz if exists
              const lecture = {
                id: raw.lecture_id,
                name: raw.lecture_name,
                duration: raw.lecture_duration,
                isPreview: raw.lecture_is_preview,
                orderIndex: raw.lecture_order_index,
                requiresQuiz: raw.lecture_requires_quiz,
                // Only return fileUrl for preview lectures (security)
                fileUrl: raw.lecture_is_preview ? raw.lecture_file_url : undefined,
                quizzes: raw.quiz_id ? [{
                  id: raw.quiz_id,
                  title: raw.quiz_title,
                  creatorId: raw.quiz_creator_id,
                }] : [],
              };
              acc.push(lecture);
            }
            
            return acc;
          }, [] as any[])
          .sort((a, b) => a.orderIndex - b.orderIndex); // Sort lectures by orderIndex ASC

        return {
          ...chapter,
          lecture: lecturesForChapter,
        };
      })
      .sort((a, b) => a.orderIndex - b.orderIndex); // Sort chapters by orderIndex ASC

    return result as Chapter[];
  }

  async findOne(id: string): Promise<Chapter> {
    const chapter = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.course', 'course')
      .select(['chapter', 'course.id', 'course.name'])
      .where('chapter.id = :id', { id })
      .getOne();
    if (!chapter) {
      throw new BadRequestException('Chapter not found');
    }
    return chapter;
  }

  async update(id: string, updateChapterDto: UpdateChapterDto): Promise<Chapter> {
    const chapter = await this.findOne(id);
    const oldOrderIndex = chapter.orderIndex;
    const newOrderIndex = updateChapterDto.orderIndex;

    // If orderIndex is being changed, reorder other chapters
    if (newOrderIndex !== undefined && newOrderIndex !== oldOrderIndex) {
      if (newOrderIndex > oldOrderIndex) {
        // Moving down: decrease orderIndex of items between old and new position
        await this.chapterRepository
          .createQueryBuilder()
          .update(Chapter)
          .set({ orderIndex: () => 'order_index - 1' })
          .where('courseId = :courseId', { courseId: chapter.courseId })
          .andWhere('orderIndex > :oldOrderIndex', { oldOrderIndex })
          .andWhere('orderIndex <= :newOrderIndex', { newOrderIndex })
          .execute();
      } else {
        // Moving up: increase orderIndex of items between new and old position
        await this.chapterRepository
          .createQueryBuilder()
          .update(Chapter)
          .set({ orderIndex: () => 'order_index + 1' })
          .where('courseId = :courseId', { courseId: chapter.courseId })
          .andWhere('orderIndex >= :newOrderIndex', { newOrderIndex })
          .andWhere('orderIndex < :oldOrderIndex', { oldOrderIndex })
          .execute();
      }
    }

    return await this.chapterRepository.save({ ...chapter, ...updateChapterDto });
  }

  async remove(id: string): Promise<void> {
    await this.chapterRepository.softDelete(id);
  }

  async findAllChapterOfCourseForEnrolled(courseId: string, userId: string): Promise<Chapter[]> {
    // Check if user is enrolled in this course
    const enrollment = await this.enrollmentRepository.findOne({
      where: { courseId, userId },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    const chapters = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.course', 'course')
      .leftJoin(
        'lectures',
        'lecture',
        'lecture.chapter_id = chapter.id AND lecture.deleted_at IS NULL',
      )
      .leftJoin(
        'quizzes',
        'quiz',
        'quiz.entity_id = lecture.id',
      )
      .select(['chapter', 'course.id', 'course.name'])
      .addSelect('lecture.id', 'lecture_id')
      .addSelect('lecture.name', 'lecture_name')
      .addSelect('lecture.duration', 'lecture_duration')
      .addSelect('lecture.is_preview', 'lecture_is_preview')
      .addSelect('lecture.order_index', 'lecture_order_index')
      .addSelect('lecture.file_url', 'lecture_file_url')
      .addSelect('lecture.requires_quiz', 'lecture_requires_quiz')
      .addSelect('quiz.id', 'quiz_id')
      .addSelect('quiz.title', 'quiz_title')
      .addSelect('quiz.creator_id', 'quiz_creator_id')
      .where('chapter.course_id = :courseId', { courseId })
      .getRawAndEntities();

    const result = chapters.entities
      .map((chapter) => {
        const lecturesForChapter = chapters.raw
          .filter((raw) => raw.chapter_id === chapter.id && raw.lecture_id !== null)
          .reduce((acc, raw) => {
            const existingLecture = acc.find(l => l.id === raw.lecture_id);
            
            if (existingLecture) {
              // Add quiz to existing lecture if not already added
              if (raw.quiz_id && !existingLecture.quizzes.some(q => q.id === raw.quiz_id)) {
                existingLecture.quizzes.push({
                  id: raw.quiz_id,
                  title: raw.quiz_title,
                  creatorId: raw.quiz_creator_id,
                });
              }
            } else {
              // Create new lecture with quiz if exists
              const lecture = {
                id: raw.lecture_id,
                name: raw.lecture_name,
                duration: raw.lecture_duration,
                isPreview: raw.lecture_is_preview,
                orderIndex: raw.lecture_order_index,
                requiresQuiz: raw.lecture_requires_quiz,
                // Return fileUrl for enrolled users (they have access to all videos)
                fileUrl: raw.lecture_file_url,
                quizzes: raw.quiz_id ? [{
                  id: raw.quiz_id,
                  title: raw.quiz_title,
                  creatorId: raw.quiz_creator_id,
                }] : [],
              };
              acc.push(lecture);
            }
            
            return acc;
          }, [] as any[])
          .sort((a, b) => a.orderIndex - b.orderIndex);

        return {
          ...chapter,
          lecture: lecturesForChapter,
        };
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);

    return result as Chapter[];
  }
}
