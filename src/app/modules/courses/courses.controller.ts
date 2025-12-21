import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
  Patch,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FilterCourseDto } from './dto/filter-course.dto';
import { TestCreateCourseDto } from './dto/test-create-course.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/app/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/app/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { CourseOwnershipGuard } from './guards/course-ownership.guard';

@ApiTags('Courses')
@ApiBearerAuth('bearer')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: User) {
    const course = await this.coursesService.create(createCourseDto, user.id);
    return {
      message: 'Course created successfully',
      ...course,
    };
  }

  @Get()
  @Public()
  async getAllCourseForUser(@Query() filterDto: FilterCourseDto) {
    const results = await this.coursesService.getAllCourseForUser(filterDto);

    return {
      message: 'Courses retrieved successfully',
      ...results,
    };
  }

  @Get('hot-course')
  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  async getHotCourses(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const results = await this.coursesService.getHotCourses(page, limit);

    return {
      message: 'Hot courses retrieved successfully',
      ...results,
    };
  }

  @Get('on-sale')
  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  async getCoursesOnSale(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const results = await this.coursesService.getCoursesOnSale(page, limit);

    return {
      message: 'Courses on sale retrieved successfully',
      ...results,
    };
  }

  @Get('instructor/my-courses')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  async getMyInstructorCourses(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const results = await this.coursesService.getInstructorCourses(user.id, page, limit);

    return {
      message: 'Instructor courses retrieved successfully',
      ...results,
    };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    return {
      message: 'Course retrieved successfully',
      ...course,
    };
  }

  @Put(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(CourseOwnershipGuard)
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    const course = await this.coursesService.update(id, updateCourseDto);
    return {
      message: 'Course updated successfully',
      ...course,
    };
  }

  @Patch(':id/status')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(CourseOwnershipGuard)
  async updateStatusOfCourse(@Param('id') id: string) {
    await this.coursesService.updateStatusOfCourse(id);
    return {
      message: 'Course status updated successfully',
    };
  }

  @Delete(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(CourseOwnershipGuard)
  async remove(@Param('id') id: string) {
    await this.coursesService.remove(id);
    return {
      message: 'Course deleted successfully',
    };
  }

  @Post('recalculate-stats')
  @Roles(UserRole.ADMIN)
  async recalculateStats() {
    const result = await this.coursesService.recalculateAllCourseStats();
    return {
      message: result.message,
      data: {
        chaptersUpdated: result.chaptersUpdated,
        coursesUpdated: result.coursesUpdated,
      },
    };
  }

  @Post('test-create')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create test courses with chapters and lectures',
    description:
      'Generate and create multiple fake Vietnamese courses with chapters and lectures for testing purposes. Only accessible by admin users.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          example: 5,
          description: 'Number of test courses to create',
        },
        chaptersPerCourse: {
          type: 'number',
          example: 5,
          description: 'Number of chapters per course (optional, default: 5)',
        },
        lecturesPerChapter: {
          type: 'number',
          example: 5,
          description: 'Number of lectures per chapter (optional, default: 5)',
        },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Test courses created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Successfully created 5 test courses' },
        data: {
          type: 'object',
          properties: {
            created: { type: 'number', example: 5 },
            chapters: { type: 'number', example: 25 },
            lectures: { type: 'number', example: 125 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async testCreate(
    @Body()
    body: { quantity: number; chaptersPerCourse?: number; lecturesPerChapter?: number },
    @CurrentUser() user: User,
  ) {
    const result = await this.coursesService.testCreate(
      body.quantity,
      user.id,
      body.chaptersPerCourse,
      body.lecturesPerChapter,
    );
    return {
      message: `Successfully created ${result.created} test courses with ${result.chapters} chapters, ${result.lectures} lectures, and ${result.quizzes} quizzes`,
      data: result,
    };
  }
}
