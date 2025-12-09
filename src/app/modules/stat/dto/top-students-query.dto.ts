import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TopStudentsSortBy {
  TOTAL_SPENT = 'totalSpent',
  COURSES_ENROLLED = 'coursesEnrolled',
}

export class TopStudentsQueryDto {
  @ApiPropertyOptional({
    description: 'Số lượng kết quả trả về',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sắp xếp theo tiêu chí',
    enum: TopStudentsSortBy,
    default: TopStudentsSortBy.TOTAL_SPENT,
  })
  @IsOptional()
  @IsEnum(TopStudentsSortBy)
  sortBy?: TopStudentsSortBy = TopStudentsSortBy.TOTAL_SPENT;
}
