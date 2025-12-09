import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The ID of the lecture being commented on',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  lectureId!: string;

  @ApiProperty({
    description: 'The content of the comment',
    example: 'Great explanation! I finally understand this concept.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID for replies',
    example: '123e4567-e89b-12d3-a456-426614174002',
    type: String,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
