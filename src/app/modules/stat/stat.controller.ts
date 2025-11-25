import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatService } from './stat.service';
import { HotCoursesQueryDto } from './dto/hot-courses-query.dto';
import { HotCoursesResponseDto } from './dto/hot-courses-response.dto';
import { RevenueQueryDto } from './dto/revenue-query.dto';
import { RevenueResponseDto } from './dto/revenue-response.dto';
import { InstructorStatsResponseDto } from './dto/instructor-stats-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('Statistics')
@ApiBearerAuth('bearer')
@Controller('stat')
export class StatController {
  constructor(private readonly statService: StatService) {}

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

}
