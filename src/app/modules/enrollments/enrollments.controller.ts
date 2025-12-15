import { Controller, Get, Body, Patch, Param, Req, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { EnrollmentsService } from './enrollments.service';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { EnrollFreeCourseDto } from './dto/enroll-free-course.dto';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('enrollments')
@ApiTags('Enrollments')
@ApiBearerAuth('bearer')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('instructor/my-students')
  @Roles(UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Get all students enrolled in instructor courses',
    description: 'Retrieve a paginated list of students with statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
  })
  async getInstructorStudents(
    @CurrentUser() user: User,
    @Query() filterDto: FilterEnrollmentDto,
  ) {
    const result = await this.enrollmentsService.findStudentsByInstructor(user.id, filterDto);
    return {
      message: 'Instructor students retrieved successfully',
      ...result,
    };
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  async findAllEnrollmentOfUser(@Param('userId') userId: string) {
    return this.enrollmentsService.findAllEnrollmentOfUser(userId);
  }

  @Get('my-enrollments')
  async getMyEnrollments(@CurrentUser() user: User) {
    return this.enrollmentsService.findAllEnrollmentOfUser(user.id);
  }

  @Post('enroll-free')
  async enrollFreeCourse(
    @Body() enrollFreeCourseDto: EnrollFreeCourseDto,
    @CurrentUser() user: User,
  ) {
    return this.enrollmentsService.enrollFreeCourse(enrollFreeCourseDto.courseId, user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Patch(':id/attributes')
  async updateAttributes(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
    @Req() req: Request,
  ) {
    const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/');
    const enrollment = await this.enrollmentsService.patchAttributes(
      id,
      updateAttributeDto.attributes,
      origin,
    );
    return {
      message: 'Enrollment attributes updated successfully',
      ...enrollment,
    };
  }

  @Get(':id/certificate')
  async getCertificate(@Param('id') id: string) {
    return this.enrollmentsService.getCertificate(id);
  }

  @Patch(':id/certificate/regenerate')
  async regenerateCertificate(@Param('id') id: string) {
    return this.enrollmentsService.regenerateCertificate(id);
  }
}
