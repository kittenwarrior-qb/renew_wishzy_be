import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiProperty({
    example: true,
    description: 'Course status (active/inactive)',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
