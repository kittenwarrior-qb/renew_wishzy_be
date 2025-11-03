import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/app/entities/order.entity';
import { OrderDetail } from 'src/app/entities/order-detail.entity';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail]), EnrollmentsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
