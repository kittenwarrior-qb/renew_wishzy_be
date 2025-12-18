import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsInt,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

export class CreateQuizDto {
  @ApiProperty({
    example: 'JavaScript Basics Quiz',
    description: 'Title of the quiz',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example:
      'Test your knowledge of JavaScript fundamentals including variables, functions, and basic syntax.',
    description: 'Detailed description of what the quiz covers',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the quiz is publicly visible to all users',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the quiz is free to take. If false, a price must be set.',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Price in VND for taking the quiz (only applicable if isFree is false)',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'Time limit for completing the quiz in minutes. Leave empty for no time limit.',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  timeLimit?: number;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID của lecture mà quiz được gắn kèm (nếu có). Quiz với entityId sẽ là bài kiểm tra của khóa học.',
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({
    type: [CreateQuestionDto],
    description: 'Array of questions for this quiz. Must contain at least one question.',
    example: [
      {
        questionText: 'What keyword is used to declare a variable in JavaScript?',
        points: 10,
        answerOptions: [
          { optionText: 'var, let, or const', isCorrect: true },
          { optionText: 'variable', isCorrect: false },
          { optionText: 'int', isCorrect: false },
          { optionText: 'string', isCorrect: false },
        ],
      },
      {
        questionText: 'Which symbol is used for single-line comments in JavaScript?',
        points: 5,
        answerOptions: [
          { optionText: '//', isCorrect: true },
          { optionText: '#', isCorrect: false },
          { optionText: '/*', isCorrect: false },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
