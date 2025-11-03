import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { PaymentMethod } from 'src/app/entities/order.entity';
import { CreateOrderDetailDto } from './create-order-detail.dto';

export class CreateOrderDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    description: 'Voucher ID',
  })
  @IsUUID()
  @IsOptional()
  voucherId?: string;

  @ApiProperty({ example: 100000, required: true })
  @IsNotEmpty()
  @IsNumber()
  totalPrice!: number;

  @ApiProperty({
    example: 'vnpay',
    enum: PaymentMethod,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({
    example: [
      {
        courseId: '123e4567-e89b-12d3-a456-426614174000',
        price: 100000,
      },
    ],
    required: true,
  })
  @IsNotEmpty()
  orderItems: CreateOrderDetailDto[];
}
