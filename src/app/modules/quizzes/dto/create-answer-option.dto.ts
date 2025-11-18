import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerOptionDto {
  @ApiProperty({ example: 'Paris', description: 'Answer option text' })
  @IsString()
  @IsNotEmpty()
  optionText: string;

  @ApiProperty({ example: true, description: 'Whether this option is correct' })
  @IsBoolean()
  isCorrect: boolean;
}
