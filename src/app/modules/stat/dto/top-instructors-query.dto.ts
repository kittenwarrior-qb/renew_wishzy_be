import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TopInstructorsSortBy {
  RATING = 'rating',
  STUDENTS = 'students',
  COURSES = 'courses',
}

export class TopInstructorsQueryDto {
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
    enum: TopInstructorsSortBy,
    default: TopInstructorsSortBy.RATING,
  })
  @IsOptional()
  @IsEnum(TopInstructorsSortBy)
  sortBy?: TopInstructorsSortBy = TopInstructorsSortBy.RATING;
}
