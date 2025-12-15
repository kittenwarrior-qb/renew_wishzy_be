import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyCommentDto {
  @ApiProperty({
    description: 'Content of the reply',
    example: 'Thank you for your feedback!',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
