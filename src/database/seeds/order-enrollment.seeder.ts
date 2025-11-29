import { DataSource } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from '../../app/entities/order.entity';
import { OrderDetail } from '../../app/entities/order-detail.entity';
import { Enrollment, EnrollmentStatus } from '../../app/entities/enrollment.entity';

export async function seedOrdersAndEnrollments(dataSource: DataSource) {
  const orderRepository = dataSource.getRepository(Order);
  const orderDetailRepository = dataSource.getRepository(OrderDetail);
  const enrollmentRepository = dataSource.getRepository(Enrollment);

  // Check if orders already exist
  const existingOrders = await orderRepository.count();
  if (existingOrders > 0) {
    console.log('⏭️  Seed orders already exist, skipping...');
    return;
  }

  // Get users, courses, and vouchers
  const users = await dataSource.query("SELECT id FROM users WHERE role = 'user' LIMIT 20");
  const courses = await dataSource.query('SELECT id, price FROM courses');
  const vouchers = await dataSource.query(
    "SELECT id, discount_value, discount_type FROM vouchers WHERE is_active = true LIMIT 5",
  );

  if (users.length === 0 || courses.length === 0) {
    console.log('⚠️  Users or courses not found. Please seed them first.');
    return;
  }

  const paymentMethods = ['momo', 'vnpay', 'zalopay'];
  const orderStatuses = ['pending', 'completed', 'cancelled'];
  const enrollmentStatuses = ['not_started', 'ongoing', 'completed'];

  // Create 60-80 orders
  const numberOfOrders = 70;

  for (let i = 0; i < numberOfOrders; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // 80% completed, 10% pending, 10% cancelled
    const random = Math.random();
    let status: string;
    if (random < 0.8) {
      status = 'completed';
    } else if (random < 0.9) {
      status = 'pending';
    } else {
      status = 'cancelled';
    }

    // Randomly use voucher (40% chance)
    const useVoucher = Math.random() < 0.4 && vouchers.length > 0;
    const voucherId = useVoucher ? vouchers[Math.floor(Math.random() * vouchers.length)].id : null;

    // Each order has 1-4 courses
    const numberOfCourses = Math.floor(Math.random() * 4) + 1;
    const selectedCourses = [...courses]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(numberOfCourses, courses.length));

    // Calculate total price
    let totalPrice = selectedCourses.reduce((sum, course) => sum + parseFloat(course.price), 0);

    // Apply voucher discount
    if (useVoucher && voucherId) {
      const voucher = vouchers.find((v) => v.id === voucherId);
      if (voucher) {
        if (voucher.discount_type === 'percent') {
          totalPrice = totalPrice * (1 - voucher.discount_value / 100);
        } else {
          totalPrice = totalPrice - voucher.discount_value;
        }
      }
    }

    // Create order with random date in the past 90 days
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000));

    const order = await orderRepository.save({
      userId: user.id,
      voucherId,
      totalPrice: Math.max(totalPrice, 0),
      status: status as OrderStatus,
      paymentMethod: paymentMethod as PaymentMethod,
      createdAt,
      updatedAt: createdAt,
    } as any);

    // Create detail orders
    const detailOrders = [];
    for (const course of selectedCourses) {
      const detailOrder = await orderDetailRepository.save({
        orderId: order.id,
        courseId: course.id,
        price: parseFloat(course.price),
        createdAt,
        updatedAt: createdAt,
      });
      detailOrders.push(detailOrder);
    }

    // Create enrollments for completed orders
    if (status === 'completed') {
      for (const detailOrder of detailOrders) {
        // Random enrollment status
        const enrollRandom = Math.random();
        let enrollStatus: string;
        let progress: number;

        if (enrollRandom < 0.3) {
          // 30% completed
          enrollStatus = 'completed';
          progress = 100;
        } else if (enrollRandom < 0.7) {
          // 40% ongoing
          enrollStatus = 'ongoing';
          progress = Math.floor(Math.random() * 90) + 10; // 10-99%
        } else {
          // 30% not started
          enrollStatus = 'not_started';
          progress = 0;
        }

        // Certificate URL for completed enrollments
        const certificateUrl = enrollStatus === 'completed' 
          ? `https://wishzy.com/certificates/${order.userId}/${detailOrder.courseId}.pdf`
          : null;

        // Last access date
        const enrollmentDate = createdAt;
        const lastAccess = enrollStatus === 'not_started'
          ? enrollmentDate
          : new Date(createdAt.getTime() + Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)); // Up to 60 days after enrollment

        await enrollmentRepository.save({
          userId: user.id,
          courseId: detailOrder.courseId,
          detailOrderId: detailOrder.id,
          enrollmentDate,
          status: enrollStatus as EnrollmentStatus,
          progress,
          lastAccess,
          certificateUrl,
          createdAt: enrollmentDate,
          updatedAt: lastAccess,
        } as any);
      }
    }
  }

  console.log(`✅ Successfully seeded ${numberOfOrders} orders with detail orders and enrollments!`);
}
