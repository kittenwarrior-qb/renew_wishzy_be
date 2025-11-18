import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAnswerOptionDto } from './create-answer-option.dto';

export class CreateQuestionDto {
  @ApiProperty({ example: 'What is the capital of France?', description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({ example: 1, description: 'Points for this question', minimum: 1 })
  @IsInt()
  @Min(1)
  points: number;

  @ApiProperty({ type: [CreateAnswerOptionDto], description: 'Answer options (minimum 2)' })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerOptionDto)
  answerOptions: CreateAnswerOptionDto[];
}
