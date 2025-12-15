import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAnswerOptionDto } from './create-answer-option.dto';

export class CreateQuestionDto {
  @ApiPropertyOptional({
    example: '159706de-d5f0-45a1-a820-5d7294ac0f11',
    description: 'Quiz ID (optional, will be ignored during creation/update)',
  })
  @IsString()
  @IsOptional()
  quizId?: string;

  @ApiProperty({
    example: 'What is the capital of France?',
    description: 'The question text that will be displayed to quiz takers',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({
    example: 10,
    description: 'Points awarded for answering this question correctly',
    minimum: 1,
    required: true,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  points: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Order index for display (auto-generated if not provided)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiProperty({
    type: [CreateAnswerOptionDto],
    description:
      'List of answer options (minimum 2 required). At least one must be marked as correct.',
    example: [
      { optionText: 'Paris', isCorrect: true },
      { optionText: 'London', isCorrect: false },
      { optionText: 'Berlin', isCorrect: false },
      { optionText: 'Madrid', isCorrect: false },
    ],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerOptionDto)
  answerOptions: CreateAnswerOptionDto[];
}
