import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { EnrollmentStatus } from 'src/app/entities/enrollment.entity';

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({
    description: 'Enrollment status',
    enum: EnrollmentStatus,
    example: EnrollmentStatus.ONGOING,
  })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @ApiPropertyOptional({
    description: 'Course progress percentage (0-100)',
    example: 45,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;
}
