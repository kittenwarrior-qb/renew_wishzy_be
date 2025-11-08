import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNumber()
  @IsNotEmpty()
  rating!: number;
}
