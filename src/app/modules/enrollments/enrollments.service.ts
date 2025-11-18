import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { In, Repository } from 'typeorm';
import { Lecture } from 'src/app/entities/lecture.entity';
import { Chapter } from 'src/app/entities/chapter.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,

    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>

  ) {}
  async create(createEnrollmentDtos: CreateEnrollmentDto[]): Promise<Enrollment[]> {
    const enrollments = this.enrollmentRepository.create(createEnrollmentDtos);
    return this.enrollmentRepository.save(enrollments);
  }

  async findAllEnrollmentOfUser(userId: string): Promise<Enrollment[]> {
    const enrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoin('enrollment.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.fullName', 'user.avatar'])
      .where('enrollment.userId = :userId', { userId })
      .getMany();
    return enrollments;
  }

  async findOne(id: string) {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id } });
    if (!enrollment) {
      throw new BadRequestException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    // Update fields
    if (updateEnrollmentDto.status !== undefined) {
      enrollment.status = updateEnrollmentDto.status;
    }
    if (updateEnrollmentDto.progress !== undefined) {
      enrollment.progress = updateEnrollmentDto.progress;
    }

    // Auto update last access time
    enrollment.lastAccess = new Date();

    return await this.enrollmentRepository.save(enrollment);
  }

  async patchAttributes(enrollmentId: string, attributes: Record<string, any>): Promise<Enrollment> {
    const enrollment = await this.findOne(enrollmentId);
    enrollment.attributes = enrollment.attributes ? Object.assign(enrollment.attributes, attributes) : attributes;
    const finishedLectures = enrollment.attributes.finishedLectures.length;
    const courseId = enrollment.courseId;

    // Tìm tất cả chapters thuộc course này
    const chapters = await this.chapterRepository.find({
      where: { courseId },
      select: ['id']
    });

    const chapterIds = chapters.map(chapter => chapter.id);
    console.log('chapter id');
    console.log(chapterIds);

    // Đếm tất cả lectures thuộc các chapters này
    const totalLectures = await this.lectureRepository.count({
      where: {
        chapterId: In(chapterIds.length > 0 ? chapterIds : [])
      }
    });

    console.log(totalLectures);

    const newProgress = totalLectures > 0 ? (finishedLectures / totalLectures) * 100 : 0;

    enrollment.progress = newProgress;
    enrollment.lastAccess = new Date();
    
    return await this.enrollmentRepository.save(enrollment);
  }
}
