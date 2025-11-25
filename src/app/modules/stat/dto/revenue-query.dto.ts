import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RevenueMode {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class RevenueQueryDto {
  @ApiProperty({ 
    description: 'Mode thống kê (theo ngày, tuần, tháng, năm)',
    enum: RevenueMode,
    example: RevenueMode.MONTH
  })
  @IsEnum(RevenueMode)
  mode!: RevenueMode;

  @ApiPropertyOptional({ 
    description: 'Ngày bắt đầu (ISO 8601 format)',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    description: 'Ngày kết thúc (ISO 8601 format)',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
