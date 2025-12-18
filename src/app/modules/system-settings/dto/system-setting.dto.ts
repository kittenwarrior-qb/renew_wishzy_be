import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({
    description: 'Giá trị mới của setting',
    example: '70',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  value!: string;

  @ApiPropertyOptional({
    description: 'Mô tả của setting',
    example: 'Tỉ lệ phần trăm doanh thu instructor nhận được',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class SettingResponseDto {
  @ApiProperty({ description: 'Key của setting' })
  key!: string;

  @ApiProperty({ description: 'Giá trị của setting' })
  value!: string;

  @ApiPropertyOptional({ description: 'Mô tả của setting' })
  description?: string;
}

export class AllSettingsResponseDto {
  @ApiProperty({ type: [SettingResponseDto] })
  items!: SettingResponseDto[];
}
