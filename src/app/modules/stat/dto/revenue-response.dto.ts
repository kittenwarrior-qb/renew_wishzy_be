import { ApiProperty } from '@nestjs/swagger';
import { RevenueMode } from './revenue-query.dto';

export class RevenueDataPointDto {
  @ApiProperty({ description: 'Nhãn thời gian (ví dụ: 2024-01-15, 2024-45, 2024-01, 2024)', example: '2024-01' })
  period!: string;

  @ApiProperty({ description: 'Năm', example: 2024, required: false })
  year?: number;

  @ApiProperty({ description: 'Tháng (1-12)', example: 11, required: false })
  month?: number;

  @ApiProperty({ description: 'Tuần (1-53)', example: 45, required: false })
  week?: number;

  @ApiProperty({ description: 'Ngày trong tháng (1-31)', example: 15, required: false })
  day?: number;

  @ApiProperty({ description: 'Ngày bắt đầu của khoảng thời gian', example: '2024-11-03', required: false })
  startDate?: string;

  @ApiProperty({ description: 'Ngày kết thúc của khoảng thời gian', example: '2024-11-09', required: false })
  endDate?: string;

  @ApiProperty({ description: 'Tổng doanh thu trong khoảng thời gian', example: 50000000 })
  revenue!: number;

  @ApiProperty({ description: 'Số lượng đơn hàng', example: 25 })
  orderCount!: number;

  @ApiProperty({ description: 'Số lượng khóa học bán được', example: 30 })
  courseSoldCount!: number;
}

export class RevenueResponseDto {
  @ApiProperty({ 
    description: 'Mode thống kê',
    enum: RevenueMode
  })
  mode!: RevenueMode;

  @ApiProperty({ 
    description: 'Tổng doanh thu thực nhận (Admin: systemRevenue, Instructor: instructorRevenue)',
    example: 150000000
  })
  totalRevenue!: number;

  @ApiProperty({ 
    description: 'Tổng doanh thu trước khi chia (gross)',
    example: 200000000
  })
  grossRevenue?: number;

  @ApiProperty({ 
    description: 'Doanh thu tháng gần nhất',
    example: 15000000
  })
  monthlyRevenue!: number;

  @ApiProperty({ 
    description: 'Tổng số đơn hàng',
    example: 75
  })
  totalOrders!: number;

  @ApiProperty({ 
    description: 'Tổng số học viên',
    example: 342
  })
  totalStudents!: number;

  @ApiProperty({ 
    description: 'Tổng số khóa học đã bán',
    example: 12
  })
  totalCourses!: number;

  @ApiProperty({ 
    description: 'Doanh thu trung bình mỗi khóa học',
    example: 10416667
  })
  averageRevenuePerCourse!: number;

  @ApiProperty({ 
    description: 'Tỷ lệ tăng trưởng so với kỳ trước (%)',
    example: 15.5
  })
  growthRate!: number;

  @ApiProperty({ 
    description: 'Tỉ lệ phần trăm instructor nhận được',
    example: 70
  })
  instructorPercentage!: number;

  @ApiProperty({ 
    description: 'Doanh thu hệ thống giữ lại (totalRevenue * (100 - instructorPercentage) / 100)',
    example: 45000000
  })
  systemRevenue!: number;

  @ApiProperty({ 
    description: 'Tổng doanh thu trả cho instructor (totalRevenue * instructorPercentage / 100)',
    example: 105000000
  })
  instructorRevenue!: number;

  @ApiProperty({ 
    description: 'Dữ liệu theo từng khoảng thời gian',
    type: [RevenueDataPointDto]
  })
  details!: RevenueDataPointDto[];

  @ApiProperty({ 
    description: 'Ngày bắt đầu lọc (nếu có)',
    required: false
  })
  startDate?: string;

  @ApiProperty({ 
    description: 'Ngày kết thúc lọc (nếu có)',
    required: false
  })
  endDate?: string;
}
