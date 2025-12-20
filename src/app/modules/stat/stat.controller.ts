import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatService } from './stat.service';
import { HotCoursesQueryDto } from './dto/hot-courses-query.dto';
import { HotCoursesResponseDto } from './dto/hot-courses-response.dto';
import { RevenueQueryDto } from './dto/revenue-query.dto';
import { RevenueResponseDto } from './dto/revenue-response.dto';
import { InstructorStatsResponseDto } from './dto/instructor-stats-response.dto';
import { TopStudentsQueryDto } from './dto/top-students-query.dto';
import { TopStudentsResponseDto } from './dto/top-students-response.dto';
import { TopInstructorsQueryDto } from './dto/top-instructors-query.dto';
import { TopInstructorsResponseDto } from './dto/top-instructors-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('Statistics')
@ApiBearerAuth('bearer')
@Controller('stat')
export class StatController {
  constructor(private readonly statService: StatService) {}

  @Get('dashboard-summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Lấy thống kê tổng quan cho dashboard',
    description: 'Trả về số học viên, giảng viên, khóa học và đơn hàng hôm nay'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thống kê thành công'
  })
  async getDashboardSummary() {
    return this.statService.getDashboardSummary();
  }

  @Get('hot-courses')
  @ApiOperation({ 
    summary: 'Lấy danh sách khóa học hot nhất',
    description: 'Thống kê các khóa học phổ biến nhất dựa trên số lượng lượt mua (enrollments), bao gồm cả thông tin doanh thu'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách khóa học hot thành công',
    type: HotCoursesResponseDto
  })
  async getHotCourses(@Query() query: HotCoursesQueryDto): Promise<HotCoursesResponseDto> {
    return this.statService.getHotCourses(query);
  }

  @Get('revenue')
  @ApiOperation({ 
    summary: 'Tổng hợp doanh thu',
    description: 'Thống kê doanh thu từ các đơn hàng đã thanh toán, hỗ trợ group theo ngày, tuần, tháng, năm'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thống kê doanh thu thành công',
    type: RevenueResponseDto
  })
  async getRevenue(@Query() query: RevenueQueryDto): Promise<RevenueResponseDto> {
    return this.statService.getRevenue(query);
  }

  @Get('instructor')
  @Roles(UserRole.INSTRUCTOR)
  @ApiOperation({ 
    summary: 'Thống kê dashboard cho giảng viên',
    description: 'Lấy thống kê tổng quan cho giảng viên hiện tại: học viên, khóa học, doanh thu, và câu hỏi/bình luận gần đây'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thống kê giảng viên thành công',
    type: InstructorStatsResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Chỉ dành cho giảng viên'
  })
  async getInstructorStats(@CurrentUser() user: User): Promise<InstructorStatsResponseDto> {
    return this.statService.getInstructorStats(user.id);
  }

  @Get('top-students')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Lấy danh sách học viên hàng đầu',
    description: 'Thống kê các học viên theo chi tiêu hoặc số khóa học đã đăng ký (chỉ dành cho Admin)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách học viên hàng đầu thành công',
    type: TopStudentsResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Chỉ dành cho Admin'
  })
  async getTopStudents(@Query() query: TopStudentsQueryDto): Promise<TopStudentsResponseDto> {
    return this.statService.getTopStudents(query);
  }

  @Get('top-instructors')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Lấy danh sách giảng viên hàng đầu',
    description: 'Thống kê các giảng viên theo rating, số học viên, hoặc số khóa học (chỉ dành cho Admin)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách giảng viên hàng đầu thành công',
    type: TopInstructorsResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Chỉ dành cho Admin'
  })
  async getTopInstructors(@Query() query: TopInstructorsQueryDto): Promise<TopInstructorsResponseDto> {
    return this.statService.getTopInstructors(query);
  }

  @Get('top-courses-by-revenue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Lấy danh sách khóa học theo doanh thu',
    description: 'Thống kê các khóa học theo tổng doanh thu, bao gồm số học viên đang theo học (chỉ dành cho Admin)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách khóa học theo doanh thu thành công'
  })
  async getTopCoursesByRevenue(@Query('limit') limit: number = 10) {
    return this.statService.getTopCoursesByRevenue(limit);
  }

}

