import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsInt } from 'class-validator';
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
  @IsInt()
  @IsOptional()
  orderIndex?: number;
}
