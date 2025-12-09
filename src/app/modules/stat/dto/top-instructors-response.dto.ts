import { ApiProperty } from '@nestjs/swagger';

export class TopInstructorItemDto {
  @ApiProperty({ description: 'ID giảng viên' })
  id!: string;

  @ApiProperty({ description: 'Tên giảng viên' })
  fullName!: string;

  @ApiProperty({ description: 'Email giảng viên' })
  email!: string;

  @ApiProperty({ description: 'Avatar giảng viên', required: false })
  avatar?: string;

  @ApiProperty({ description: 'Role', example: 'instructor' })
  role!: string;

  @ApiProperty({ description: 'Đánh giá trung bình', example: 4.8 })
  rating!: number;

  @ApiProperty({ description: 'Số khóa học', example: 12 })
  courses!: number;

  @ApiProperty({ description: 'Số học viên', example: 345 })
  students!: number;

  @ApiProperty({ 
    description: 'Danh mục chuyên môn', 
    type: [String],
    example: ['Lập trình', 'Toán học'] 
  })
  specialties!: string[];
}

export class TopInstructorsResponseDto {
  @ApiProperty({ 
    type: [TopInstructorItemDto], 
    description: 'Danh sách giảng viên hàng đầu' 
  })
  data!: TopInstructorItemDto[];

  @ApiProperty({ description: 'Tổng số giảng viên trong hệ thống' })
  total!: number;
}
