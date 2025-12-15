import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../entities/enrollment.entity';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto';

@Injectable()
export class InstructorEnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getEnrollmentsForInstructorCourses(instructorId: string, filterDto: FilterEnrollmentDto) {
    const { page = 1, limit = 10, courseId, status, search, sortBy = 'enrolledAt', sortOrder = 'desc' } = filterDto;

    console.log('🔍 InstructorEnrollmentsService - Input params:', {
      instructorId,
      filterDto,
      sortBy,
      sortOrder
    });

    // Get instructor's courses
    const instructorCourses = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.created_by = :instructorId', { instructorId })
      .select(['course.id', 'course.name'])
      .getMany();

    console.log('📚 Found instructor courses:', instructorCourses.length);

    if (instructorCourses.length === 0) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPage: 0,
          hasNext: false,
          hasPrev: false,
        },
        statistics: {
          totalStudents: 0,
          activeStudents: 0,
          completedStudents: 0,
          averageProgress: 0,
        },
        message: 'No courses found for instructor',
      };
    }

    const courseIds = instructorCourses.map(course => course.id);

    // Build query for enrollments
    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .leftJoinAndSelect('enrollment.course', 'course')
      .where('enrollment.courseId IN (:...courseIds)', { courseIds });

    // Apply filters
    if (courseId) {
      queryBuilder.andWhere('enrollment.courseId = :courseId', { courseId });
    }

    if (status) {
      queryBuilder.andWhere('enrollment.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Get total count first (without sorting to avoid issues)
    const total = await queryBuilder.getCount();
    console.log('📊 Total enrollments found:', total);

    // Get all enrollments for this page (without sorting in query)
    const enrollments = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    console.log('📋 Raw enrollments retrieved:', enrollments.length);

    // Apply sorting in JavaScript (safer than SQL orderBy)
    let sortedEnrollments = [...enrollments];
    if (sortBy === 'enrolledAt' || sortBy === 'joinDate') {
      sortedEnrollments.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
    } else if (sortBy === 'progress') {
      sortedEnrollments.sort((a, b) => {
        return sortOrder === 'desc' ? (b.progress || 0) - (a.progress || 0) : (a.progress || 0) - (b.progress || 0);
      });
    } else if (sortBy === 'status') {
      sortedEnrollments.sort((a, b) => {
        return sortOrder === 'desc' ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status);
      });
    }

    console.log('✅ Enrollments sorted successfully');

    // Get all enrollments for statistics (without pagination)
    const allEnrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.courseId IN (:...courseIds)', { courseIds })
      .getMany();

    // Calculate statistics
    const statistics = {
      totalStudents: allEnrollments.length,
      activeStudents: allEnrollments.filter(e => e.status === 'ongoing').length,
      completedStudents: allEnrollments.filter(e => e.status === 'completed').length,
      averageProgress: allEnrollments.length > 0
        ? allEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / allEnrollments.length
        : 0,
    };

    return {
      items: sortedEnrollments.map(enrollment => ({
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        status: enrollment.status,
        progress: enrollment.progress,
        enrolledAt: enrollment.createdAt,
        completedAt: enrollment.status === 'completed' ? enrollment.updatedAt : null,
        certificateUrl: enrollment.certificateUrl,
        lastAccess: enrollment.lastAccess,
        user: enrollment.user ? {
          id: enrollment.user.id,
          fullName: enrollment.user.fullName,
          email: enrollment.user.email,
          avatar: enrollment.user.avatar,
        } : null,
        course: enrollment.course ? {
          id: enrollment.course.id,
          title: enrollment.course.name,
          thumbnail: enrollment.course.thumbnail,
          price: enrollment.course.price,
        } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      statistics,
      message: 'Enrollments retrieved successfully',
    };
  }
}