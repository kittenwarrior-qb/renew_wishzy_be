import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FilterCourseDto } from './dto/filter-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/app/entities/course.entity';
import { Repository } from 'typeorm';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import removeAccents from 'remove-accents';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}
  async create(createCourseDto: CreateCourseDto, userId: string): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    course.createdBy = userId;
    return await this.courseRepository.save(course);
  }

  async getAllCourseForUser(filter: FilterCourseDto): Promise<PaginationResponse<Course>> {
    const {
      page,
      limit,
      name,
      categoryId,
      createdBy,
      rating,
      courseLevel,
      minPrice,
      maxPrice,
      status,
    } = filter;

    // Normalize search name for accent-insensitive search
    const searchName = name ? removeAccents(name.toLowerCase()) : null;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoin('course.creator', 'creator')
      .addSelect(['creator.id', 'creator.fullName', 'creator.email'])
      .leftJoinAndSelect('course.chapters', 'chapter')
      .leftJoinAndSelect('chapter.lectures', 'lecture')
      .leftJoinAndSelect('lecture.quizzes', 'quiz')
      .loadRelationCountAndMap('course.reviewCount', 'course.feedbacks');
    if (categoryId) {
      queryBuilder.andWhere('course.categoryId = :categoryId', { categoryId });
    }
    if (createdBy) {
      queryBuilder.andWhere('course.createdBy = :createdBy', { createdBy });
    }
    if (rating) {
      queryBuilder.andWhere('course.rating = :rating', { rating });
    }
    if (courseLevel) {
      queryBuilder.andWhere('course.level = :courseLevel', { courseLevel });
    }
    if (minPrice) {
      queryBuilder.andWhere('course.price >= :minPrice', { minPrice });
    }
    if (maxPrice) {
      queryBuilder.andWhere('course.price <= :maxPrice', { maxPrice });
    }
    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    queryBuilder.orderBy('course.created_at', 'DESC');

    // Get all courses first
    let [courses, total] = await queryBuilder.getManyAndCount();

    // Filter by name with accent-insensitive search
    if (searchName) {
      courses = courses.filter((course) =>
        removeAccents(course.name.toLowerCase()).includes(searchName),
      );
      total = courses.length;
    }

    // Apply pagination after filtering
    const paginatedCourses = courses.slice((page - 1) * limit, page * limit);

    return {
      items: paginatedCourses,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoin('course.creator', 'creator')
      .addSelect(['creator.id', 'creator.fullName', 'creator.email', 'creator.avatar'])
      .leftJoinAndSelect('course.chapters', 'chapter')
      .leftJoinAndSelect('chapter.lectures', 'lecture')
      .leftJoinAndSelect('lecture.quizzes', 'quiz')
      .loadRelationCountAndMap('course.reviewCount', 'course.feedbacks')
      .where('course.id = :id', { id })
      .orderBy('chapter.orderIndex', 'ASC')
      .addOrderBy('lecture.orderIndex', 'ASC')
      .getOne();

    if (!course) {
      throw new BadRequestException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async updateStatusOfCourse(id: string): Promise<void> {
    const course = await this.findOne(id);
    course.status = !course.status;
    await this.courseRepository.save(course);
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);

    Object.assign(course, updateCourseDto);

    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    // Soft delete
    await this.courseRepository.softDelete(id);
  }

  async getHotCourses(page: number = 1, limit: number = 10): Promise<PaginationResponse<Course>> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoin('course.creator', 'creator')
      .addSelect(['creator.id', 'creator.fullName', 'creator.email'])
      .leftJoinAndSelect('course.chapters', 'chapter')
      .leftJoinAndSelect('chapter.lectures', 'lecture')
      .leftJoinAndSelect('lecture.quizzes', 'quiz')
      .loadRelationCountAndMap('course.reviewCount', 'course.feedbacks')
      .where('course.status = :status', { status: true })
      .orderBy('course.averageRating', 'DESC')
      .addOrderBy('course.numberOfStudents', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [courses, total] = await queryBuilder.getManyAndCount();

    return {
      items: courses,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async getInstructorCourses(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResponse<Course>> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoin('course.creator', 'creator')
      .addSelect(['creator.id', 'creator.fullName', 'creator.email'])
      .leftJoinAndSelect('course.chapters', 'chapter')
      .leftJoinAndSelect('chapter.lectures', 'lecture')
      .leftJoinAndSelect('lecture.quizzes', 'quiz')
      .loadRelationCountAndMap('course.reviewCount', 'course.feedbacks')
      .where('course.createdBy = :instructorId', { instructorId })
      .orderBy('course.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [courses, total] = await queryBuilder.getManyAndCount();

    return {
      items: courses,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async incrementNumberOfStudents(courseId: string): Promise<void> {
    await this.courseRepository.increment({ id: courseId }, 'numberOfStudents', 1);
  }

  async updateAverageRating(courseId: string, averageRating: number): Promise<void> {
    await this.courseRepository.update(courseId, {
      averageRating: Math.round(averageRating * 100) / 100,
    });
  }

  async getCoursesOnSale(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResponse<Course>> {
    const now = new Date();

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoin('course.creator', 'creator')
      .addSelect(['creator.id', 'creator.fullName', 'creator.email'])
      .leftJoinAndSelect('course.chapters', 'chapter')
      .leftJoinAndSelect('chapter.lectures', 'lecture')
      .leftJoinAndSelect('lecture.quizzes', 'quiz')
      .loadRelationCountAndMap('course.reviewCount', 'course.feedbacks')
      .where('course.status = :status', { status: true })
      .andWhere("course.sale_info->>'saleStartDate' IS NOT NULL")
      .andWhere("course.sale_info->>'saleEndDate' IS NOT NULL")
      .andWhere("(course.sale_info->>'saleStartDate')::timestamp <= :now", { now })
      .andWhere("(course.sale_info->>'saleEndDate')::timestamp >= :now", { now })
      .orderBy('course.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [courses, total] = await queryBuilder.getManyAndCount();

    return {
      items: courses,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Recalculate all course statistics (durations, ratings, comment counts)
   * This should be called by admin when data needs to be fixed
   */
  async recalculateAllCourseStats(): Promise<{
    chaptersUpdated: number;
    coursesUpdated: number;
    message: string;
  }> {
    const queryRunner = this.courseRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Update chapter durations
      const chapterResult = await queryRunner.query(`
        UPDATE chapters c
        SET duration = COALESCE((
          SELECT SUM(l.duration)
          FROM lectures l
          WHERE l.chapter_id = c.id
            AND l.deleted_at IS NULL
        ), 0)
        WHERE c.deleted_at IS NULL
      `);

      // Step 2: Update course durations
      await queryRunner.query(`
        UPDATE courses co
        SET total_duration = COALESCE((
          SELECT SUM(ch.duration)
          FROM chapters ch
          WHERE ch.course_id = co.id
            AND ch.deleted_at IS NULL
        ), 0)
        WHERE co.deleted_at IS NULL
      `);

      // Step 3: Update average ratings
      await queryRunner.query(`
        UPDATE courses co
        SET average_rating = COALESCE((
          SELECT ROUND(AVG(c.rating)::numeric, 2)
          FROM feedbacks c
          WHERE c.course_id = co.id
        ), 0)
        WHERE co.deleted_at IS NULL
      `);

      // Step 4: Update comment counts
      const courseResult = await queryRunner.query(`
        UPDATE courses co
        SET rating = COALESCE((
          SELECT COUNT(*)
          FROM feedbacks c
          WHERE c.course_id = co.id
        ), 0)
        WHERE co.deleted_at IS NULL
      `);

      await queryRunner.commitTransaction();

      return {
        chaptersUpdated: chapterResult[1] || 0,
        coursesUpdated: courseResult[1] || 0,
        message: 'Successfully recalculated all course statistics',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to recalculate course statistics');
    } finally {
      await queryRunner.release();
    }
  }

  async testCreate(
    quantity: number,
    userId: string,
    chaptersPerCourse: number = 5,
    lecturesPerChapter: number = 5,
  ): Promise<{
    created: number;
    chapters: number;
    lectures: number;
    quizzes: number;
    documents: number;
    stats: any;
  }> {
    const {
      CourseTestDataGenerator,
      ChapterTestDataGenerator,
      LectureTestDataGenerator,
      QuizTestDataGenerator,
      DocumentTestDataGenerator,
    } = await import('./courses.create-test');

    const categoryIds = await this.courseRepository.manager.query(
      'SELECT id FROM categories LIMIT 10',
    );

    if (categoryIds.length === 0) {
      throw new BadRequestException('No categories found. Please create categories first.');
    }

    const categoryIdList = categoryIds.map((cat: any) => cat.id);

    let totalChapters = 0;
    let totalLectures = 0;
    let totalQuizzes = 0;
    let totalDocuments = 0;
    const courseStats: any[] = [];

    for (let i = 0; i < quantity; i++) {
      // Generate course data
      const courseDto = CourseTestDataGenerator.generateVietnameseCourse(categoryIdList, userId);

      // Extract tech from course name for quiz generation
      const techMatch = courseDto.name.match(/với\s+(\w+(?:\.\w+)?)/);
      const tech = techMatch ? techMatch[1] : 'React';

      // 1. Save course
      const course = await this.courseRepository.save({
        ...courseDto,
        rating: 0,
        status: true,
        averageRating: 0,
        numberOfStudents: 0,
      });

      // 2. Save course documents
      const courseDocuments = DocumentTestDataGenerator.generateCourseDocuments(
        course.id,
        userId,
        course.name,
      );
      for (const docData of courseDocuments) {
        await this.courseRepository.manager.getRepository('Document').save({
          ...docData,
          entityId: course.id,
        });
        totalDocuments++;
      }

      // 3. Save chapters using chaptersPerCourse parameter
      const savedChapters: any[] = [];
      const chapters = ChapterTestDataGenerator.generateChapters(
        course.id,
        userId,
        chaptersPerCourse,
      );
      for (const chapterData of chapters) {
        const chapter = await this.courseRepository.manager.getRepository('Chapter').save({
          ...chapterData,
          courseId: course.id,
        });
        savedChapters.push(chapter);

        // Save chapter documents
        const chapterDocuments = DocumentTestDataGenerator.generateChapterDocuments(
          chapter.id,
          userId,
          chapter.name,
        );
        for (const docData of chapterDocuments) {
          await this.courseRepository.manager.getRepository('Document').save({
            ...docData,
            entityId: chapter.id,
          });
          totalDocuments++;
        }
      }
      totalChapters += savedChapters.length;

      // 4. Save lectures using lecturesPerChapter parameter and track which need quizzes
      const lecturesNeedingQuiz: Array<{
        id: string;
        name: string;
        tech: string;
        questionCount: number;
      }> = [];

      for (let chapterIndex = 0; chapterIndex < savedChapters.length; chapterIndex++) {
        const chapter = savedChapters[chapterIndex];

        // Use legacy method with lecturesPerChapter parameter
        const lectures = LectureTestDataGenerator.generateLectures(
          chapter.id,
          userId,
          lecturesPerChapter,
          'alternate', // Every 3rd lecture has quiz
        );

        for (const lectureData of lectures) {
          const lecture = await this.courseRepository.manager.getRepository('Lecture').save({
            ...lectureData,
            chapterId: chapter.id,
          });

          // Save lecture documents (only for non-quiz lectures)
          if (!lectureData.requiresQuiz) {
            const lectureDocuments = DocumentTestDataGenerator.generateLectureDocuments(
              lecture.id,
              userId,
              lecture.name,
              'theory', // Default type for legacy method
            );
            for (const docData of lectureDocuments) {
              await this.courseRepository.manager.getRepository('Document').save({
                ...docData,
                entityId: lecture.id,
              });
              totalDocuments++;
            }
          }

          if (lectureData.requiresQuiz) {
            // Final chapter quiz has 5 questions, others have 3
            const isFinalChapter = chapterIndex === savedChapters.length - 1;
            lecturesNeedingQuiz.push({
              id: lecture.id,
              name: lecture.name,
              tech,
              questionCount: isFinalChapter ? 5 : 3,
            });
          }

          totalLectures++;
        }
      }

      // 5. Save quizzes
      for (const lectureInfo of lecturesNeedingQuiz) {
        const quizData = QuizTestDataGenerator.generateQuizForLecture(
          lectureInfo.id,
          userId,
          lectureInfo.name,
          lectureInfo.tech,
          lectureInfo.questionCount,
        );

        const { questions, ...quizFields } = quizData;

        const quiz = await this.courseRepository.manager.getRepository('Quiz').save(quizFields);

        for (const questionData of questions) {
          const { answerOptions, ...questionFields } = questionData;

          const question = await this.courseRepository.manager.getRepository('Question').save({
            ...questionFields,
            quizId: quiz.id,
          });

          for (const optionData of answerOptions) {
            await this.courseRepository.manager.getRepository('AnswerOption').save({
              ...optionData,
              questionId: question.id,
            });
          }
        }

        totalQuizzes++;
      }

      // Collect stats for this course
      courseStats.push({
        name: course.name,
        chapters: savedChapters.length,
        lectures: savedChapters.length * lecturesPerChapter,
        quizzes: lecturesNeedingQuiz.length,
        documents: courseDocuments.length,
      });
    }

    return {
      created: quantity,
      chapters: totalChapters,
      lectures: totalLectures,
      quizzes: totalQuizzes,
      documents: totalDocuments,
      stats: courseStats,
    };
  }
}
