import { IsNotEmpty, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLectureNoteDto {
  @ApiProperty({
    description: 'The ID of the lecture',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  lectureId!: string;

  @ApiProperty({
    description: 'The content of the note',
    example: 'Important concept explained here',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'Timestamp in seconds when the note was created',
    example: 120,
    type: Number,
  })
  @IsInt()
  @Min(0)
  timestampSeconds!: number;
}
