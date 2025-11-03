import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateOrderDetailDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
    description: 'Course ID',
  })
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({
    example: 100000,
    required: true,
    description: 'Price',
  })
  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
    description: 'Order ID',
  })
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;
}
