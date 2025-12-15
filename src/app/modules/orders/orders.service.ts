import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from 'src/app/entities/order.entity';
import { Repository } from 'typeorm';
import { OrderDetail } from 'src/app/entities/order-detail.entity';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import { vnpay } from 'src/config/vnpay.config';

export interface OrderWithDetails extends Order {
  orderDetails: OrderDetail[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
  ) {}
  async create(createOrderDto: CreateOrderDto, userId: string): Promise<OrderWithDetails> {
    const order = this.orderRepository.create(createOrderDto);
    order.userId = userId;
    order.status = OrderStatus.PENDING;
    const savedOrder = await this.orderRepository.save(order);

    const orderDetails = createOrderDto.orderItems.map((orderItem) => {
      return {
        ...orderItem,
        orderId: savedOrder.id,
      };
    });

    await this.orderDetailRepository.save(orderDetails);

    return await this.findOne(savedOrder.id);
  }

  async findOne(id: string): Promise<OrderWithDetails> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.voucher', 'voucher')
      .leftJoin('order.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.fullName', 'user.avatar'])
      .where('order.id = :id', { id })
      .getOne();

    if (!order) {
      throw new BadRequestException(`Order with ID ${id} not found`);
    }

    const orderDetails = await this.orderDetailRepository.find({
      where: { orderId: id },
      relations: ['course'],
    });

    return { ...order, orderDetails };
  }

  async findUserOrders(userId: string, filter: FilterOrderDto): Promise<PaginationResponse<any>> {
    const { page = 1, limit = 10, courseId, voucherId } = filter;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC');

    if (voucherId) {
      queryBuilder.andWhere('order.voucherId = :voucherId', { voucherId });
    }

    if (courseId) {
      queryBuilder
        .leftJoin('detail_orders', 'orderDetail', 'orderDetail.order_id = order.id')
        .andWhere('orderDetail.course_id = :courseId', { courseId });
    }

    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    if (orders.length === 0) {
      return {
        items: [],
        pagination: {
          totalPage: 0,
          totalItems: 0,
          currentPage: page,
          itemsPerPage: limit,
        },
      };
    }

    const orderIds = orders.map((order) => order.id);

    const allOrderDetails = await this.orderDetailRepository
      .createQueryBuilder('orderDetail')
      .leftJoinAndSelect('orderDetail.course', 'course')
      .where('orderDetail.orderId IN (:...orderIds)', { orderIds })
      .getMany();

    const orderIdsWithVoucher = orders.filter((o) => o.voucherId).map((o) => o.id);
    let vouchers = [];
    if (orderIdsWithVoucher.length > 0) {
      vouchers = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.voucher', 'voucher')
        .where('order.id IN (:...orderIds)', { orderIds: orderIdsWithVoucher })
        .getMany();
    }

    const ordersWithDetails = orders.map((order) => {
      const orderDetails = allOrderDetails.filter((detail) => detail.orderId === order.id);
      const orderWithVoucher = vouchers.find((v) => v.id === order.id);
      return {
        ...order,
        voucher: orderWithVoucher?.voucher || null,
        orderDetails,
      };
    });

    return {
      items: ordersWithDetails,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findAll(filter: FilterOrderDto): Promise<PaginationResponse<any>> {
    const { page = 1, limit = 10, courseId, voucherId } = filter;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.fullName', 'user.avatar']);

    if (voucherId) {
      queryBuilder.andWhere('order.voucherId = :voucherId', { voucherId });
    }

    if (courseId) {
      queryBuilder
        .leftJoin('detail_orders', 'orderDetail', 'orderDetail.order_id = order.id')
        .andWhere('orderDetail.course_id = :courseId', { courseId });
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    if (orders.length === 0) {
      return {
        items: [],
        pagination: {
          totalPage: 0,
          totalItems: 0,
          currentPage: page,
          itemsPerPage: limit,
        },
      };
    }

    const orderIds = orders.map((order) => order.id);

    const allOrderDetails = await this.orderDetailRepository
      .createQueryBuilder('orderDetail')
      .leftJoinAndSelect('orderDetail.course', 'course')
      .where('orderDetail.orderId IN (:...orderIds)', { orderIds })
      .getMany();

    const orderIdsWithVoucher = orders.filter((o) => o.voucherId).map((o) => o.id);
    let vouchers = [];
    if (orderIdsWithVoucher.length > 0) {
      vouchers = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.voucher', 'voucher')
        .where('order.id IN (:...orderIds)', { orderIds: orderIdsWithVoucher })
        .getMany();
    }

    const ordersWithDetails = orders.map((order) => {
      const orderDetails = allOrderDetails.filter((detail) => detail.orderId === order.id);
      const orderWithVoucher = vouchers.find((v) => v.id === order.id);
      return {
        ...order,
        voucher: orderWithVoucher?.voucher || null,
        orderDetails,
      };
    });

    return {
      items: ordersWithDetails,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderWithDetails> {
    const order = await this.findOne(orderId);

    if (!order) {
      throw new BadRequestException(`Order with ID ${orderId} not found`);
    }

    order.status = status;
    return await this.orderRepository.save(order);
  }

  async createVnpayPaymentUrl(
    orderId: string,
    amount: number,
    ipAddr: string,
    orderInfo?: string,
  ): Promise<string> {
    // Validate amount (VNPay requires minimum 5,000 VND)
    if (amount < 5000) {
      throw new BadRequestException(
        `Invalid payment amount: ${amount}. VNPay requires minimum 5,000 VND`,
      );
    }

    try {
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: ipAddr,
        vnp_ReturnUrl: `${process.env.VNP_RETURN_URL!}/payment-callback`,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo || `Transaction of order: ${orderId}`,
        vnp_BankCode: 'NCB',
      });

      return paymentUrl;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyVnpayReturn(query: any): Promise<boolean> {
    try {
      const verify = vnpay.verifyReturnUrl(query);
      return verify.isVerified;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get orders for courses created by instructor (for revenue tracking)
   */
  async findInstructorOrders(
    instructorId: string,
    filter: FilterOrderDto,
  ): Promise<PaginationResponse<any>> {
    const { page = 1, limit = 10, courseId, voucherId } = filter;

    console.log('🔍 FindInstructorOrders - Input:', { instructorId, filter });

    // Debug: Check if instructor has any courses
    const instructorCoursesQuery = this.orderDetailRepository
      .createQueryBuilder('orderDetail')
      .leftJoin('orderDetail.course', 'course')
      .select(['course.id', 'course.name', 'course.created_by'])
      .where('course.created_by = :instructorId', { instructorId })
      .limit(5);
    
    const instructorCourses = await instructorCoursesQuery.getRawMany();
    console.log('📚 Instructor courses:', instructorCourses);

    // Simplified approach: Get order IDs directly with raw SQL
    const orderIdsQuery = `
      SELECT DISTINCT od.order_id 
      FROM detail_orders od 
      INNER JOIN courses c ON c.id = od.course_id 
      WHERE c.created_by = $1 
      ${courseId ? 'AND od.course_id = $2' : ''}
    `;
    
    const queryParams = courseId ? [instructorId, courseId] : [instructorId];
    console.log('🔍 SQL Query:', orderIdsQuery);
    console.log('🔍 Query Parameters:', queryParams);

    const orderIdsResult = await this.orderDetailRepository.query(orderIdsQuery, queryParams);
    console.log('🔍 Raw query result:', orderIdsResult);
    
    const instructorOrderIds = orderIdsResult.map((row: any) => row.order_id).filter((id: any) => id !== null && id !== undefined);

    console.log('📋 Found order IDs:', instructorOrderIds.length);
    console.log('📋 Order IDs:', instructorOrderIds);
    console.log('📋 Order IDs types:', instructorOrderIds.map(id => ({ id, type: typeof id })));

    if (instructorOrderIds.length === 0) {
      return {
        items: [],
        pagination: {
          totalPage: 0,
          totalItems: 0,
          currentPage: page,
          itemsPerPage: limit,
        },
      };
    }

    // Build main query with found order IDs
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.fullName', 'user.avatar'])
      .where('order.id IN (:...instructorOrderIds)', { instructorOrderIds })
      .orderBy('order.createdAt', 'DESC');

    if (voucherId) {
      queryBuilder.andWhere('order.voucherId = :voucherId', { voucherId });
    }

    const total = await queryBuilder.getCount();

    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const orders = await queryBuilder.getMany();

    console.log('📦 Orders found:', orders.length);
    console.log('📦 Orders data:', orders.map(o => ({ id: o.id, status: o.status, totalPrice: o.totalPrice })));

    if (orders.length === 0) {
      console.log('❌ No orders found - returning empty result');
      return {
        items: [],
        pagination: {
          totalPage: 0,
          totalItems: 0,
          currentPage: page,
          itemsPerPage: limit,
        },
      };
    }

    const orderIds = orders.map((order) => order.id);

    // Get all order details for these orders
    const allOrderDetails = await this.orderDetailRepository
      .createQueryBuilder('orderDetail')
      .leftJoinAndSelect('orderDetail.course', 'course')
      .where('orderDetail.orderId IN (:...orderIds)', { orderIds })
      .getMany();

    // Get vouchers if any
    const orderIdsWithVoucher = orders.filter((o) => o.voucherId).map((o) => o.id);
    let vouchers = [];
    if (orderIdsWithVoucher.length > 0) {
      vouchers = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.voucher', 'voucher')
        .where('order.id IN (:...orderIds)', { orderIds: orderIdsWithVoucher })
        .getMany();
    }

    const ordersWithDetails = orders.map((order) => {
      const orderDetails = allOrderDetails.filter((detail) => detail.orderId === order.id);
      const orderWithVoucher = vouchers.find((v) => v.id === order.id);
      return {
        ...order,
        voucher: orderWithVoucher?.voucher || null,
        orderDetails,
      };
    });

    return {
      items: ordersWithDetails,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }
}
