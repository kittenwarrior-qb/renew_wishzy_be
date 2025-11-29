import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { Course } from 'src/app/entities/course.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly mailService: MailService,
  ) {}
  async createNewUserByAdmin(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({ ...createUserDto, verified: true });

    return await this.usersRepository.save(user);
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(`User with email ${createAdminDto.email} already exists`);
    }

    // Create admin user
    const adminUser = this.usersRepository.create({
      ...createAdminDto,
      role: UserRole.ADMIN,
      verified: true,
    });

    return await this.usersRepository.save(adminUser);
  }

  async findAll(filters: FilterUserDto): Promise<PaginationResponse<User>> {
    const { page, limit, fullName, email, role, isInstructorActive } = filters;
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (fullName) {
      queryBuilder.andWhere('user.fullName ILIKE :fullName', { fullName: `%${fullName}%` });
    }

    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isInstructorActive !== undefined) {
      queryBuilder.andWhere('user.isInstructorActive = :isInstructorActive', {
        isInstructorActive,
      });
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: users,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findOne(userId);

    // Handle empty string for date fields
    const sanitizedDto = { ...updateProfileDto };
    if (sanitizedDto.dob === '') {
      sanitizedDto.dob = null;
    }

    Object.assign(user, sanitizedDto);
    return await this.usersRepository.save(user);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<User> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user with password (need to explicitly select password field)
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'password', 'email', 'fullName'], // Include password field
    });

    if (!user) {
      throw new BadRequestException(`User not found`);
    }

    // Verify current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Set new password
    user.setPassword(newPassword);

    // Save user with new password
    await this.usersRepository.save(user);

    // Return user without password
    return await this.findOne(userId);
  }

  async findAllInstructors(filters: FilterUserDto): Promise<PaginationResponse<User>> {
    const { page, limit, fullName, email } = filters;
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Filter by instructor role
    queryBuilder.andWhere('user.role = :role', { role: UserRole.INSTRUCTOR });

    if (fullName) {
      queryBuilder.andWhere('user.fullName ILIKE :fullName', { fullName: `%${fullName}%` });
    }

    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    const [instructors, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: instructors,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async getInstructorStudents(
    instructorId: string,
    filters: FilterUserDto,
  ): Promise<PaginationResponse<User>> {
    const { page, limit, fullName, email } = filters;

    // Verify instructor exists and has instructor role
    const instructor = await this.findOne(instructorId);
    if (instructor.role !== UserRole.INSTRUCTOR) {
      throw new BadRequestException('User is not an instructor');
    }

    // Get all courses created by this instructor
    const courses = await this.courseRepository.find({
      where: { createdBy: instructorId },
      select: ['id'],
    });

    if (courses.length === 0) {
      return {
        items: [],
        pagination: {
          totalPage: 0,
          totalItems: 0,
          currentPage: page,
          itemsPerPage: limit,
        },
      };
    }

    const courseIds = courses.map((course) => course.id);

    // Build query to get students enrolled in instructor's courses
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .innerJoin(Enrollment, 'enrollment', 'enrollment.userId = user.id')
      .where('enrollment.courseId IN (:...courseIds)', { courseIds })
      .andWhere('user.role = :role', { role: UserRole.USER })
      .distinct(true);

    if (fullName) {
      queryBuilder.andWhere('user.fullName ILIKE :fullName', { fullName: `%${fullName}%` });
    }

    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    const [students, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: students,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async testCreate(quantity: number, role?: UserRole): Promise<{ created: number }> {
    const { UserTestDataGenerator } = await import('./users.create-test');

    const fakeUsers = UserTestDataGenerator.generateVietnameseUsers(quantity, role);

    await this.usersRepository.insert(fakeUsers);

    return { created: quantity };
  }

  async requestInstructorRole(userId: string): Promise<User> {
    const user = await this.findOne(userId);

    // Check if already an instructor
    if (user.role === UserRole.INSTRUCTOR) {
      throw new BadRequestException('You are already an instructor');
    }

    // Check if already requested
    if (user.isInstructorActive && user.role === UserRole.USER) {
      throw new BadRequestException('Your instructor request is pending approval');
    }

    // Set pending status: role = user, isInstructorActive = true
    user.isInstructorActive = true;

    return await this.usersRepository.save(user);
  }

  async approveInstructorRole(userId: string): Promise<User> {
    const user = await this.findOne(userId);

    // Check if user has pending request
    if (!user.isInstructorActive || user.role !== UserRole.USER) {
      throw new BadRequestException('User does not have a pending instructor request');
    }

    // Approve: change role to instructor and set isInstructorActive to false
    user.role = UserRole.INSTRUCTOR;
    user.isInstructorActive = false;

    const updatedUser = await this.usersRepository.save(user);

    // Send approval email (fire and forget - don't wait for result)
    this.mailService.sendInstructorApprovalEmail(user.email, user.fullName).catch((error) => {
      console.error('Failed to send instructor approval email, but continuing:', error);
    });

    return updatedUser;
  }

  async rejectInstructorRole(userId: string): Promise<User> {
    const user = await this.findOne(userId);

    // Check if user has pending request
    if (!user.isInstructorActive || user.role !== UserRole.USER) {
      throw new BadRequestException('User does not have a pending instructor request');
    }

    // Reject: keep role as user and set isInstructorActive to false
    user.isInstructorActive = false;

    return await this.usersRepository.save(user);
  }

  async getPendingInstructors(filters: FilterUserDto): Promise<PaginationResponse<User>> {
    const { page, limit, fullName, email } = filters;
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Filter pending instructors: role = user AND isInstructorActive = true
    queryBuilder
      .andWhere('user.role = :role', { role: UserRole.USER })
      .andWhere('user.isInstructorActive = :isInstructorActive', { isInstructorActive: true });

    if (fullName) {
      queryBuilder.andWhere('user.fullName ILIKE :fullName', { fullName: `%${fullName}%` });
    }

    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: users,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }
}
