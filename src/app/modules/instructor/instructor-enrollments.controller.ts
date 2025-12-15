import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../../entities/user.entity';
import { InstructorEnrollmentsService } from './instructor-enrollments.service';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto';

@Controller('instructor/enrollments')
@ApiTags('Instructor Enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
@ApiBearerAuth('bearer')
export class InstructorEnrollmentsController {
  constructor(private readonly instructorEnrollmentsService: InstructorEnrollmentsService) {}

  @Get()
  async getInstructorEnrollments(
    @CurrentUser() user: User,
    @Query() filterDto: FilterEnrollmentDto,
  ) {
    const result = await this.instructorEnrollmentsService.getEnrollmentsForInstructorCourses(user.id, filterDto);

    // Return structure that matches FE expectations
    return {
      success: true,
      data: {
        items: result.items,
        pagination: result.pagination,
        statistics: result.statistics,
      },
      message: result.message,
    };
  }
}