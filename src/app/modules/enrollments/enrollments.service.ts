import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment, EnrollmentStatus } from 'src/app/entities/enrollment.entity';
import { In, Repository } from 'typeorm';
import { Lecture } from 'src/app/entities/lecture.entity';
import { Chapter } from 'src/app/entities/chapter.entity';
import { Course } from 'src/app/entities/course.entity';
import { User } from 'src/app/entities/user.entity';
import { CertificateService } from './certificate.service';
import { MailService } from '../mail/mail.service';
import { CloudinaryService } from '../uploads/cloudinary.service';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,

    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly certificateService: CertificateService,
    private readonly mailService: MailService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createEnrollmentDtos: CreateEnrollmentDto[]): Promise<Enrollment[]> {
    const enrollments = this.enrollmentRepository.create(createEnrollmentDtos);
    return this.enrollmentRepository.save(enrollments);
  }

  async enrollFreeCourse(courseId: string, userId: string): Promise<Enrollment> {
    // Kiểm tra khóa học có tồn tại không
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      select: ['id', 'price', 'name'],
    });

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    // Kiểm tra khóa học có miễn phí không
    const coursePrice = Number(course.price);
    if (coursePrice !== 0) {
      throw new BadRequestException('This course is not free. Please purchase it through the normal checkout process.');
    }

    // Kiểm tra user đã enroll chưa
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { courseId, userId },
    });

    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this course');
    }

    // Tạo enrollment mới
    const enrollment = this.enrollmentRepository.create({
      courseId,
      userId,
      detailOrderId: null, // Không có order cho khóa học miễn phí
    });

    const savedEnrollment = await this.enrollmentRepository.save(enrollment);

    // Tăng số lượng học viên
    await this.courseRepository.increment({ id: courseId }, 'numberOfStudents', 1);

    return savedEnrollment;
  }

  async findAllEnrollmentOfUser(userId: string): Promise<Enrollment[]> {
    const enrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoin('enrollment.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.fullName', 'user.avatar'])
      .where('enrollment.userId = :userId', { userId })
      .orderBy('enrollment.created_at', 'DESC')
      .getMany();
    return enrollments;
  }

  async findOne(id: string) {
    const enrollment = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('enrollment.user', 'user')
      .where('enrollment.id = :id', { id })
      .getOne();
    if (!enrollment) {
      throw new BadRequestException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (updateEnrollmentDto.status !== undefined) {
      enrollment.status = updateEnrollmentDto.status;
    }
    if (updateEnrollmentDto.progress !== undefined) {
      enrollment.progress = updateEnrollmentDto.progress;
    }

    enrollment.lastAccess = new Date();

    return await this.enrollmentRepository.save(enrollment);
  }

  async patchAttributes(
    enrollmentId: string,
    attributes: Record<string, any>,
    origin?: string,
  ): Promise<Enrollment> {
    const enrollment = await this.findOne(enrollmentId);
    const hadCertificate = !!enrollment.certificateUrl;
    const wasCompleted = enrollment.progress === 100;

    enrollment.attributes = enrollment.attributes
      ? Object.assign(enrollment.attributes, attributes)
      : attributes;
    const finishedLectures = enrollment.attributes.finishedLectures?.length || 0;
    const courseId = enrollment.courseId;

    const chapters = await this.chapterRepository.find({
      where: { courseId },
      select: ['id'],
    });

    const chapterIds = chapters.map((chapter) => chapter.id);

    // Đếm tất cả lectures thuộc các chapters này
    const totalLectures = await this.lectureRepository.count({
      where: {
        chapterId: In(chapterIds.length > 0 ? chapterIds : []),
      },
    });

    const newProgress = totalLectures > 0 ? (finishedLectures / totalLectures) * 100 : 0;

    enrollment.progress = Math.round(newProgress);
    enrollment.lastAccess = new Date();

    // Auto-update status based on progress
    if (enrollment.progress === 100 && !wasCompleted) {
      enrollment.status = EnrollmentStatus.COMPLETED;

      // Generate certificate if not already generated
      if (!hadCertificate) {
        enrollment.certificateUrl = this.certificateService.generateCertificateUrl(
          enrollmentId,
          origin,
        );

        // Generate and upload certificate image asynchronously
        this.generateAndUploadCertificate(enrollment).catch((error) => {
          console.error('Failed to generate certificate:', error);
        });

        // Send certificate email asynchronously
        this.sendCertificateNotification(enrollment).catch((error) => {
          console.error('Failed to send certificate email:', error);
        });
      }
    } else if (enrollment.progress > 0) {
      enrollment.status = EnrollmentStatus.ONGOING;
    }

    return await this.enrollmentRepository.save(enrollment);
  }

  private async generateAndUploadCertificate(enrollment: Enrollment): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: enrollment.userId },
        select: ['fullName'],
      });

      const course = await this.courseRepository.findOne({
        where: { id: enrollment.courseId },
        select: ['name'],
      });

      if (!user || !course) {
        throw new Error('User or course not found');
      }

      const completionDate = new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Generate certificate image
      const imageBuffer = await this.certificateService.generateCertificateImage(
        user.fullName,
        course.name,
        completionDate,
      );

      // Convert buffer to file format for Cloudinary
      const file: Express.Multer.File = {
        fieldname: 'certificate',
        originalname: `certificate-${enrollment.id}.png`,
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: imageBuffer,
        size: imageBuffer.length,
      } as Express.Multer.File;

      // Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'certificates');

      // Save certificate image URL
      enrollment.certificateImageUrl = uploadResult.secure_url;
      await this.enrollmentRepository.save(enrollment);
    } catch (error) {
      console.error('Error generating and uploading certificate:', error);
      throw error;
    }
  }

  private async sendCertificateNotification(enrollment: Enrollment): Promise<void> {
    try {
      // Wait for certificate image to be generated
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait

      while (!enrollment.certificateImageUrl && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const updatedEnrollment = await this.enrollmentRepository.findOne({
          where: { id: enrollment.id },
          select: ['certificateImageUrl'],
        });
        if (updatedEnrollment?.certificateImageUrl) {
          enrollment.certificateImageUrl = updatedEnrollment.certificateImageUrl;
          break;
        }
        attempts++;
      }

      const user = await this.userRepository.findOne({
        where: { id: enrollment.userId },
        select: ['email', 'fullName'],
      });

      const course = await this.courseRepository.findOne({
        where: { id: enrollment.courseId },
        select: ['name'],
      });

      if (user && course && enrollment.certificateUrl) {
        await this.mailService.sendCertificateEmail(
          user.email,
          user.fullName,
          course.name,
          enrollment.certificateUrl,
          enrollment.certificateImageUrl,
        );
      }
    } catch (error) {
      console.error('Error sending certificate notification:', error);
      throw error;
    }
  }

  async getCertificate(enrollmentId: string): Promise<{ certificateUrl: string | null }> {
    const enrollment = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('enrollment.user', 'user')
      .select([
        'enrollment.id',
        'enrollment.certificateUrl',
        'enrollment.progress',
        'enrollment.status',
        'course.id',
        'course.name',
        'user.id',
        'user.fullName',
        'user.email',
      ])
      .where('enrollment.id = :enrollmentId', { enrollmentId })
      .getOne();

    if (!enrollment) {
      throw new BadRequestException(`Enrollment with ID ${enrollmentId} not found`);
    }

    if (enrollment.progress < 100) {
      throw new BadRequestException('Course not completed yet');
    }

    return {
      certificateUrl: enrollment.certificateUrl || null,
    };
  }

  async regenerateCertificate(enrollmentId: string): Promise<{ certificateImageUrl: string }> {
    const enrollment = await this.findOne(enrollmentId);

    if (enrollment.progress < 100) {
      throw new BadRequestException('Course not completed yet');
    }

    // Clear old certificate
    enrollment.certificateImageUrl = null;
    await this.enrollmentRepository.save(enrollment);

    // Generate new certificate
    await this.generateAndUploadCertificate(enrollment);

    // Reload enrollment to get new URL
    const updatedEnrollment = await this.findOne(enrollmentId);

    return {
      certificateImageUrl: updatedEnrollment.certificateImageUrl || '',
    };
  }

  /**
   * Get all students enrolled in instructor's courses
   * @param instructorId - ID of the instructor
   * @param filter - Filter and pagination options
   */
  async findStudentsByInstructor(
    instructorId: string,
    filter: FilterEnrollmentDto,
  ): Promise<PaginationResponse<any>> {
    const { page = 1, limit = 10, courseId, status, search, sortBy = 'enrollmentDate', sortOrder = 'desc' } = filter;

    // Build query to find enrollments from instructor's courses
    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('enrollment.user', 'user')
      .where('course.created_by = :instructorId', { instructorId });

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

    // Apply sorting
    const sortField = sortBy === 'enrollmentDate' ? 'enrollment.created_at' : `enrollment.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Count total before pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const enrollments = await queryBuilder.getMany();

    // Calculate statistics
    const allEnrollmentsQuery = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoin('enrollment.course', 'course')
      .where('course.created_by = :instructorId', { instructorId });

    if (courseId) {
      allEnrollmentsQuery.andWhere('enrollment.courseId = :courseId', { courseId });
    }

    const allEnrollments = await allEnrollmentsQuery.getMany();

    const statistics = {
      totalStudents: allEnrollments.length,
      activeStudents: allEnrollments.filter(e => e.status === EnrollmentStatus.ONGOING).length,
      completedStudents: allEnrollments.filter(e => e.status === EnrollmentStatus.COMPLETED).length,
      averageProgress: allEnrollments.length > 0
        ? allEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / allEnrollments.length
        : 0,
    };

    return {
      items: enrollments,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
      statistics,
    };
  }
}
