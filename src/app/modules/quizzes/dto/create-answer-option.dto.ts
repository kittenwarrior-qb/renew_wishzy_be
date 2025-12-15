import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnswerOptionDto {
  @ApiProperty({
    example: 'Paris',
    description: 'Text content of the answer option',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  optionText: string;

  @ApiProperty({
    example: true,
    description:
      'Whether this option is the correct answer. Must have at least one correct answer per question.',
    required: true,
  })
  @IsBoolean()
  isCorrect: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Order index for display (auto-generated if not provided)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}
