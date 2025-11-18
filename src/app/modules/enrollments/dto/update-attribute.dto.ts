import { IsObject, IsOptional, IsArray, IsString, IsNumber, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class LectureQuality {
  @ApiProperty({ example: 'link_400.mp4' })
  @IsOptional()
  @IsString()
  '400'?: string;

  @ApiProperty({ example: 'link_720.mp4' })
  @IsOptional()
  @IsString()
  '720'?: string;

  @ApiProperty({ example: 'link_1080.mp4' })
  @IsOptional()
  @IsString()
  '1080'?: string;
}

class LectureOnLearning {
  @ApiProperty({ example: 'lecture_id' })
  @IsString()
  lectureId: string;

  @ApiProperty({ example: 40 })
  @IsNumber()
  duration: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  currentTime: number;

  @ApiProperty({ example: '2025-11-13T10:00:00Z' })
  @IsString()
  lastWatchedAt: string;

  @ApiProperty({ type: LectureQuality })
  @IsObject()
  @ValidateNested()
  @Type(() => LectureQuality)
  quality: LectureQuality;

  @ApiProperty({ example: 100 })
  @IsNumber()
  volume: number;
}

class EnrollmentAttributes {
  @ApiProperty({
    example: ['lecture_1', 'lecture_2'],
    description: 'List of finished lecture IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  finishedLectures?: string[];

  @ApiProperty({ type: LectureOnLearning })
  @IsOptional()
  @ValidateNested()
  @Type(() => LectureOnLearning)
  lectureOnlearning?: LectureOnLearning;
}

export class UpdateAttributeDto {
  @ApiProperty({
    description: 'Custom attributes for enrollment',
    example: {
      finishedLectures: ['lecture1', 'lecture2'],
      lectureOnlearning: {
        lectureId: 'lectureId',
        duration: 40,
        currentTime: 20,
        lastWatchedAt: '2025-11-13T10:00:00Z',
        quality: {
          '400': 'link_400.mp4',
        },
        volume: 100,
      },
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnrollmentAttributes)
  attributes?: EnrollmentAttributes;
}
