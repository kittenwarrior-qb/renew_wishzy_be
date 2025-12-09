import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatService } from './stat.service';
import { StatController } from './stat.controller';
import { Enrollment } from '../../entities/enrollment.entity';
import { Course } from '../../entities/course.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { Order } from '../../entities/order.entity';
import { Feedback } from '../../entities/feedback.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, Course, OrderDetail, Order, Feedback, User])],
  controllers: [StatController],
  providers: [StatService],
})
export class StatModule {}

