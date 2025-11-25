import { ApiProperty } from '@nestjs/swagger';

export class InstructorCourseDto {
  @ApiProperty({ description: 'ID khóa học' })
  courseId!: string;

  @ApiProperty({ description: 'Tên khóa học' })
  courseName!: string;

  @ApiProperty({ description: 'Số học viên đã đăng ký' })
  studentCount!: number;

  @ApiProperty({ description: 'Doanh thu từ khóa học' })
  revenue!: number;

  @ApiProperty({ description: 'Đánh giá trung bình' })
  averageRating!: number;

  @ApiProperty({ description: 'Số lượt bình luận/câu hỏi' })
  commentCount!: number;
}

export class RecentCommentDto {
  @ApiProperty({ description: 'ID bình luận' })
  commentId!: string;

  @ApiProperty({ description: 'Nội dung' })
  content!: string;

  @ApiProperty({ description: 'Tên học viên' })
  studentName!: string;

  @ApiProperty({ description: 'Tên khóa học' })
  courseName!: string;

  @ApiProperty({ description: 'Đánh giá' })
  rating!: number;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt!: Date;
}

export class InstructorStatsResponseDto {
  @ApiProperty({ description: 'Tổng số khóa học của giảng viên' })
  totalCourses!: number;

  @ApiProperty({ description: 'Tổng số học viên' })
  totalStudents!: number;

  @ApiProperty({ description: 'Tổng doanh thu' })
  totalRevenue!: number;

  @ApiProperty({ description: 'Tổng số bình luận/câu hỏi' })
  totalComments!: number;

  @ApiProperty({ description: 'Đánh giá trung bình toàn bộ khóa học' })
  overallRating!: number;

  @ApiProperty({ 
    description: 'Danh sách khóa học với thống kê',
    type: [InstructorCourseDto]
  })
  courses!: InstructorCourseDto[];

  @ApiProperty({ 
    description: 'Câu hỏi/bình luận gần đây',
    type: [RecentCommentDto]
  })
  recentComments!: RecentCommentDto[];
}
