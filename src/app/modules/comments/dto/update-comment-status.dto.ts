import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentStatus } from 'src/app/entities/comment.entity';

export class UpdateCommentStatusDto {
  @ApiProperty({
    description: 'New status for the comment',
    enum: CommentStatus,
    example: CommentStatus.REPLIED,
  })
  @IsEnum(CommentStatus)
  status!: CommentStatus;

  @ApiPropertyOptional({
    description: 'Optional reason for status change',
    example: 'Issue resolved',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
