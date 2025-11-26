import { Controller, Get, Post, Body, Param, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderStatus } from 'src/app/entities/order.entity';
import { Public } from '../auth/decorators/public.decorator';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CreateEnrollmentDto } from '../enrollments/dto/create-enrollment.dto';
import { CoursesService } from '../courses/courses.service';

@Controller('orders')
@ApiTags('Orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly enrollmentService: EnrollmentsService,
    private readonly coursesService: CoursesService,
  ) {}

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ) {
    const order = await this.ordersService.create(createOrderDto, user.id);

    // Convert totalPrice to number for comparison (TypeORM may return decimal as string)
    const totalPriceNum = Number(order.totalPrice);

    console.log('=== ORDER CREATED ===');
    console.log('Order ID:', order.id);
    console.log('Total Price:', order.totalPrice);
    console.log('Total Price (Number):', totalPriceNum);
    console.log('Type:', typeof order.totalPrice);
    console.log('Is Zero:', totalPriceNum === 0);
    console.log('====================');

    // Nếu là khóa học miễn phí (totalPrice = 0), tự động complete order
    if (totalPriceNum === 0) {
      const completedOrder = await this.ordersService.updateOrderStatus(
        order.id,
        OrderStatus.COMPLETED,
      );

      // Tạo enrollments cho các khóa học miễn phí
      const enrollentDatas: CreateEnrollmentDto[] = completedOrder.orderDetails.map(
        (orderDetail) => ({
          courseId: orderDetail.courseId,
          userId: completedOrder.userId,
          detailOrderId: orderDetail.id,
        }),
      );
      await this.enrollmentService.create(enrollentDatas);

      // Increment numberOfStudents for each course
      await Promise.all(
        completedOrder.orderDetails.map((orderDetail) =>
          this.coursesService.incrementNumberOfStudents(orderDetail.courseId),
        ),
      );

      return {
        message: 'Successfully enrolled in free course(s)',
        order: completedOrder,
      };
    }

    // Nếu có phí, tạo payment URL với VNPay
    const ipAddr =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const paymentUrl = await this.ordersService.createVnpayPaymentUrl(
      order.id,
      order.totalPrice,
      ipAddr,
    );

    return {
      message: 'Order created with PENDING status. Please complete payment.',
      paymentUrl,
    };
  }

  @Get('my-orders')
  async getMyOrders(@CurrentUser() user: User, @Query() filterDto: FilterOrderDto) {
    const results = await this.ordersService.findUserOrders(user.id, filterDto);

    return {
      ...results,
      message: 'Orders retrieved successfully',
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query() filterDto: FilterOrderDto) {
    const results = await this.ordersService.findAll(filterDto);

    return {
      ...results,
      message: 'Orders retrieved successfully',
    };
  }

  @Get('payment-callback')
  @Public()
  async vnpayCallback(@Query() query: any, @Res() res: Response) {
    const orderId = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;
    const transactionStatus = query.vnp_TransactionStatus;

    const isValid = await this.ordersService.verifyVnpayReturn(query);

    if (!isValid) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/payment-result?status=invalid&orderId=${orderId}`);
    }

    if (responseCode === '00' && transactionStatus === '00') {
      const order = await this.ordersService.updateOrderStatus(orderId, OrderStatus.COMPLETED);
      const orderDetails = order.orderDetails;
      const enrollentDatas: CreateEnrollmentDto[] = orderDetails.map((orderDetail) => {
        return {
          courseId: orderDetail.courseId,
          userId: order.userId,
          detailOrderId: orderDetail.id,
        };
      });
      await this.enrollmentService.create(enrollentDatas);

      await Promise.all(
        orderDetails.map((orderDetail) =>
          this.coursesService.incrementNumberOfStudents(orderDetail.courseId),
        ),
      );

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/payment-result?status=success&orderId=${orderId}`);
    } else {
      await this.ordersService.updateOrderStatus(orderId, OrderStatus.CANCELLED);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(
        `${frontendUrl}/payment-result?status=failed&orderId=${orderId}&code=${responseCode}`,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    return {
      ...order,
      message: 'Order retrieved successfully',
    };
  }
}
