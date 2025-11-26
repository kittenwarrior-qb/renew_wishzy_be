import { IsObject, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVideoSourcesDto {
  @ApiProperty({
    description: 'Video sources with different resolutions',
    example: {
      '360p': 'link_360.mp4',
      '480p': 'link_480.mp4',
      '720p': 'link_720.mp4',
      '1080p': 'link_1080.mp4',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  videoSources?: Record<string, string>;

  @ApiProperty({
    description: 'Video duration in seconds (real duration from video file)',
    example: 3600,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  videoDuration?: number;
}
