import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({ description: 'Câu hỏi FAQ', example: 'Làm thế nào để đăng ký khóa học?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'Câu trả lời FAQ', example: 'Bạn chỉ cần chọn khóa học mong muốn...' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ description: 'Thứ tự hiển thị', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @ApiProperty({ description: 'Trạng thái active', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
