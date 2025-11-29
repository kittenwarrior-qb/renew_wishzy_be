import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class TestCreateCourseDto {
  @ApiProperty({
    example: 10,
    description: 'Number of test courses to create',
    required: true,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  quantity!: number;
}
