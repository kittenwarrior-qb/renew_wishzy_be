import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLectureNoteDto {
  @ApiPropertyOptional({
    description: 'The content of the note',
    example: 'Updated note content',
    type: String,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Timestamp in seconds',
    example: 150,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  timestampSeconds?: number;
}
