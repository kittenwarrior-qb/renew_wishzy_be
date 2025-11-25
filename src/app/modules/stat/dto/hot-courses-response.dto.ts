import { ApiProperty } from '@nestjs/swagger';

export class HotCourseItemDto {
  @ApiProperty({ description: 'ID khóa học' })
  courseId!: string;

  @ApiProperty({ description: 'Tên khóa học' })
  courseName!: string;

  @ApiProperty({ description: 'Hình ảnh khóa học', required: false })
  thumbnail?: string;

  @ApiProperty({ description: 'Tên danh mục' })
  categoryName!: string;

  @ApiProperty({ description: 'Giá gốc khóa học' })
  price!: number;

  @ApiProperty({ description: 'Tổng doanh thu từ khóa học', example: 15000000 })
  totalRevenue!: number;

  @ApiProperty({ description: 'Tổng số lượt mua', example: 50 })
  totalSales!: number;

  @ApiProperty({ description: 'Tổng số học viên', example: 50 })
  totalStudents!: number;

  @ApiProperty({ description: 'Số lượng lượt mua (enrollment)', example: 150 })
  enrollmentCount!: number;

  @ApiProperty({ description: 'Đánh giá trung bình', example: 4.8 })
  averageRating!: number;

  @ApiProperty({ description: 'Ngày tạo khóa học' })
  createdAt!: Date;

  @ApiProperty({ description: 'Thứ hạng', example: 1 })
  rank!: number;
}

export class HotCoursesResponseDto {
  @ApiProperty({ type: [HotCourseItemDto], description: 'Danh sách khóa học hot' })
  data!: HotCourseItemDto[];

  @ApiProperty({ description: 'Tổng số khóa học' })
  total!: number;

  @ApiProperty({ description: 'Trang hiện tại' })
  page!: number;

  @ApiProperty({ description: 'Số lượng khóa học trên mỗi trang' })
  limit!: number;

  @ApiProperty({ description: 'Tổng số trang' })
  totalPages!: number;
}
