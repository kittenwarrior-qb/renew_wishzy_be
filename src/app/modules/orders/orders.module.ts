import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/app/entities/order.entity';
import { OrderDetail } from 'src/app/entities/order-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
