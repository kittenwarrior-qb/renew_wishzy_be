import { ApiProperty } from '@nestjs/swagger';

export class TopStudentItemDto {
  @ApiProperty({ description: 'ID học viên' })
  id!: string;

  @ApiProperty({ description: 'Tên học viên' })
  name!: string;

  @ApiProperty({ description: 'Email học viên' })
  email!: string;

  @ApiProperty({ description: 'Avatar học viên', required: false })
  avatar?: string;

  @ApiProperty({ description: 'Số khóa học đã đăng ký', example: 5 })
  coursesEnrolled!: number;

  @ApiProperty({ description: 'Tổng chi tiêu', example: 2500000 })
  totalSpent!: number;

  @ApiProperty({ description: 'Lần hoạt động cuối', required: false })
  lastActive?: Date;
}

export class TopStudentsResponseDto {
  @ApiProperty({ 
    type: [TopStudentItemDto], 
    description: 'Danh sách học viên hàng đầu' 
  })
  data!: TopStudentItemDto[];

  @ApiProperty({ description: 'Tổng số học viên trong hệ thống' })
  total!: number;
}
