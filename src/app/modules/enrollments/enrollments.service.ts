import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
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
}
