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
      .loadRelationCountAndMap('course.reviewCount', 'course.feedbacks')
      .where('course.id = :id', { id })
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
  ): Promise<{ created: number; chapters: number; lectures: number }> {
    const { CourseTestDataGenerator, ChapterTestDataGenerator, LectureTestDataGenerator } =
      await import('./courses.create-test');

    const categoryIds = await this.courseRepository.manager.query(
      'SELECT id FROM categories LIMIT 10',
    );

    if (categoryIds.length === 0) {
      throw new BadRequestException('No categories found. Please create categories first.');
    }

    const categoryIdList = categoryIds.map((cat: any) => cat.id);

    const fakeCourses = CourseTestDataGenerator.generateVietnameseCourses(
      quantity,
      categoryIdList,
      userId,
    );

    const courses = fakeCourses.map((course) => ({
      ...course,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
    }));

    const insertedCourses = await this.courseRepository.save(courses);

    let totalChapters = 0;
    let totalLectures = 0;

    for (const course of insertedCourses) {
      const chapters = ChapterTestDataGenerator.generateChapters(
        course.id,
        userId,
        chaptersPerCourse,
      );

      const insertedChapters = await this.courseRepository.manager
        .getRepository('Chapter')
        .save(chapters);

      totalChapters += insertedChapters.length;

      for (const chapter of insertedChapters) {
        const lectures = LectureTestDataGenerator.generateLectures(
          chapter.id,
          userId,
          lecturesPerChapter,
        );

        const insertedLectures = await this.courseRepository.manager
          .getRepository('Lecture')
          .save(lectures);

        totalLectures += insertedLectures.length;
      }
    }

    return {
      created: quantity,
      chapters: totalChapters,
      lectures: totalLectures,
    };
  }
}
