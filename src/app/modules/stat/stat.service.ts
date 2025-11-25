import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../entities/enrollment.entity';
import { Course } from '../../entities/course.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { Comment } from '../../entities/comment.entity';
import { User } from '../../entities/user.entity';
import { HotCoursesQueryDto } from './dto/hot-courses-query.dto';
import { HotCoursesResponseDto, HotCourseItemDto } from './dto/hot-courses-response.dto';
import { RevenueQueryDto, RevenueMode } from './dto/revenue-query.dto';
import { RevenueResponseDto, RevenueDataPointDto } from './dto/revenue-response.dto';
import {
  InstructorStatsResponseDto,
  InstructorCourseDto,
  RecentCommentDto,
} from './dto/instructor-stats-response.dto';

@Injectable()
export class StatService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(OrderDetail)
    private orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getHotCourses(query: HotCoursesQueryDto): Promise<HotCoursesResponseDto> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Query để đếm số lượng enrollments cho mỗi khóa học
    const enrollmentStats = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('enrollment.courseId', 'courseId')
      .addSelect('COUNT(enrollment.id)', 'enrollmentCount')
      .groupBy('enrollment.courseId')
      .orderBy('COUNT(enrollment.id)', 'DESC')
      .skip(skip)
      .take(limit)
      .getRawMany();

    // Lấy tổng số khóa học có enrollments
    const totalCount = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('COUNT(DISTINCT enrollment.courseId)', 'count')
      .getRawOne();

    const total = parseInt(totalCount?.count || '0');

    if (enrollmentStats.length === 0) {
      return {
        data: [],
        total,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Lấy thông tin chi tiết của các khóa học kèm category
    const courseIds = enrollmentStats.map((stat) => stat.courseId);
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.id IN (:...courseIds)', { courseIds })
      .getMany();

    // Tạo map để dễ dàng tra cứu khóa học
    const courseMap = new Map(courses.map((course) => [course.id, course]));

    // Tính tổng doanh thu cho mỗi khóa học từ order_details
    const revenueStats = await this.orderDetailRepository
      .createQueryBuilder('orderDetail')
      .select('orderDetail.courseId', 'courseId')
      .addSelect('SUM(orderDetail.price)', 'totalRevenue')
      .where('orderDetail.courseId IN (:...courseIds)', { courseIds })
      .groupBy('orderDetail.courseId')
      .getRawMany();

    // Tạo map cho doanh thu
    const revenueMap = new Map(
      revenueStats.map((stat) => [stat.courseId, parseFloat(stat.totalRevenue || '0')]),
    );

    // Kết hợp dữ liệu
    const data: HotCourseItemDto[] = enrollmentStats.map((stat, index) => {
      const course = courseMap.get(stat.courseId);
      const revenue = revenueMap.get(stat.courseId) || 0;
      const enrollmentCount = parseInt(stat.enrollmentCount);

      return {
        courseId: stat.courseId,
        courseName: course?.name || 'Unknown',
        thumbnail: course?.thumbnail,
        categoryName: course?.category?.name || 'Unknown',
        price: parseFloat(course?.price?.toString() || '0'),
        totalRevenue: revenue,
        totalSales: enrollmentCount,
        totalStudents: course?.numberOfStudents || enrollmentCount,
        enrollmentCount: enrollmentCount,
        averageRating: parseFloat(course?.averageRating?.toString() || '0'),
        createdAt: course?.createdAt || new Date(),
        rank: skip + index + 1,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Helper method: Tính ngày bắt đầu (thứ Hai) của tuần ISO
   * @param week - Số tuần (1-53)
   * @param year - Năm
   * @returns Date object của thứ Hai đầu tuần
   */
  private getDateOfISOWeek(week: number, year: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  }

  /**
   * Tổng hợp doanh thu từ các đơn hàng đã thanh toán
   * @param query - Query parameters với mode và date range
   * @returns Thống kê doanh thu theo khoảng thời gian
   */
  async getRevenue(query: RevenueQueryDto): Promise<RevenueResponseDto> {
    const { mode, startDate, endDate } = query;

    // Xác định grouping dựa trên mode
    let groupBy: string;

    switch (mode) {
      case RevenueMode.DAY:
        groupBy = "TO_CHAR(order.created_at, 'YYYY-MM-DD')";
        break;
      case RevenueMode.WEEK:
        groupBy = "TO_CHAR(order.created_at, 'IYYY-IW')";
        break;
      case RevenueMode.MONTH:
        groupBy = "TO_CHAR(order.created_at, 'YYYY-MM')";
        break;
      case RevenueMode.YEAR:
        groupBy = "TO_CHAR(order.created_at, 'YYYY')";
        break;
      default:
        groupBy = "TO_CHAR(order.created_at, 'YYYY-MM')";
    }

    // Build query - chỉ lấy orders, không cần join detail_orders
    let queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .select(groupBy, 'period')
      .addSelect('SUM(order.totalPrice)', 'revenue')
      .addSelect('COUNT(DISTINCT order.id)', 'orderCount')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .groupBy('period')
      .orderBy('period', 'ASC');

    // Apply date range filters nếu có
    if (startDate) {
      queryBuilder = queryBuilder.andWhere('order.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder = queryBuilder.andWhere('order.created_at <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    const rawData = await queryBuilder.getRawMany();

    // Tính tổng doanh thu và số đơn hàng
    const totalRevenue = rawData.reduce((sum, item) => sum + parseFloat(item.revenue || '0'), 0);
    const totalOrders = rawData.reduce((sum, item) => sum + parseInt(item.orderCount || '0'), 0);

    // Tính doanh thu tháng gần nhất (latest period)
    const monthlyRevenue =
      rawData.length > 0 ? parseFloat(rawData[rawData.length - 1].revenue || '0') : 0;

    // Tính tổng số học viên từ enrollments
    const totalStudentsData = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('COUNT(DISTINCT enrollment.userId)', 'count')
      .getRawOne();
    const totalStudents = parseInt(totalStudentsData?.count || '0');

    // Tính tổng số khóa học đã bán (unique courses trong order_details)
    const totalCoursesData = await this.orderDetailRepository
      .createQueryBuilder('orderDetail')
      .innerJoin('orderDetail.order', 'order')
      .select('COUNT(DISTINCT orderDetail.courseId)', 'count')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .getRawOne();
    const totalCourses = parseInt(totalCoursesData?.count || '0');

    // Tính doanh thu trung bình mỗi khóa học
    const averageRevenuePerCourse = totalCourses > 0 ? totalRevenue / totalCourses : 0;

    // Tính growth rate (so sánh period cuối với period trước đó)
    let growthRate = 0;
    if (rawData.length >= 2) {
      const latestRevenue = parseFloat(rawData[rawData.length - 1].revenue || '0');
      const previousRevenue = parseFloat(rawData[rawData.length - 2].revenue || '0');
      if (previousRevenue > 0) {
        growthRate = ((latestRevenue - previousRevenue) / previousRevenue) * 100;
      }
    }

    // Format data với thông tin chi tiết hơn
    const data: RevenueDataPointDto[] = rawData.map((item) => {
      const period = item.period;
      const dataPoint: RevenueDataPointDto = {
        period,
        revenue: parseFloat(item.revenue || '0'),
        orderCount: parseInt(item.orderCount || '0'),
        courseSoldCount: 0, // Không cần count vì đã remove join
      };

      // Parse period để tách ra year, month, week, day
      if (mode === RevenueMode.DAY) {
        // Format: YYYY-MM-DD
        const [year, month, day] = period.split('-').map(Number);
        dataPoint.year = year;
        dataPoint.month = month;
        dataPoint.day = day;
        dataPoint.startDate = period;
        dataPoint.endDate = period;
      } else if (mode === RevenueMode.WEEK) {
        // Format: YYYY-WW (e.g., 2025-45)
        const [year, week] = period.split('-').map(Number);
        dataPoint.year = year;
        dataPoint.week = week;

        // Tính startDate và endDate của tuần (ISO week)
        const weekDate = this.getDateOfISOWeek(week, year);
        const startOfWeek = new Date(weekDate);
        const endOfWeek = new Date(weekDate);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        dataPoint.startDate = startOfWeek.toISOString().split('T')[0];
        dataPoint.endDate = endOfWeek.toISOString().split('T')[0];
      } else if (mode === RevenueMode.MONTH) {
        // Format: YYYY-MM
        const [year, month] = period.split('-').map(Number);
        dataPoint.year = year;
        dataPoint.month = month;

        // Tính startDate và endDate của tháng
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        dataPoint.startDate = startOfMonth.toISOString().split('T')[0];
        dataPoint.endDate = endOfMonth.toISOString().split('T')[0];
      } else if (mode === RevenueMode.YEAR) {
        // Format: YYYY
        const year = parseInt(period);
        dataPoint.year = year;

        dataPoint.startDate = `${year}-01-01`;
        dataPoint.endDate = `${year}-12-31`;
      }

      return dataPoint;
    });

    return {
      mode,
      totalRevenue,
      monthlyRevenue,
      totalOrders,
      totalStudents,
      totalCourses,
      averageRevenuePerCourse: Math.round(averageRevenuePerCourse),
      growthRate: Math.round(growthRate * 10) / 10, // Round to 1 decimal place
      details: data,
      startDate,
      endDate,
    };
  }

  /**
   * Thống kê dashboard cho giảng viên - Sử dụng raw SQL để tránh lỗi TypeORM
   * @param instructorId - ID của giảng viên
   * @returns Thống kê học viên, khóa học, doanh thu, và câu hỏi
   */
  async getInstructorStats(instructorId: string): Promise<InstructorStatsResponseDto> {
    // Tính tổng doanh thu
    const revenueData = await this.orderDetailRepository.query(
      `
      SELECT SUM(od.price) as "totalRevenue"
      FROM detail_orders od
      INNER JOIN courses c ON c.id = od.course_id
      INNER JOIN orders o ON o.id = od.order_id
      WHERE c.created_by = $1 AND o.status = $2
      `,
      [instructorId, OrderStatus.COMPLETED],
    );
    const totalRevenue = parseFloat(revenueData[0]?.totalRevenue || '0');

    // Đếm tổng số học viên
    const studentData = await this.enrollmentRepository.query(
      `
      SELECT COUNT(DISTINCT e.user_id) as "totalStudents"
      FROM enrollments e
      INNER JOIN courses c ON c.id = e.course_id
      WHERE c.created_by = $1
      `,
      [instructorId],
    );
    const totalStudents = parseInt(studentData[0]?.totalStudents || '0');

    // Đếm tổng số khóa học
    const courseData = await this.courseRepository.query(
      `
      SELECT COUNT(c.id) as "totalCourses"
      FROM courses c
      WHERE c.created_by = $1
      `,
      [instructorId],
    );
    const totalCourses = parseInt(courseData[0]?.totalCourses || '0');

    // Đếm tổng số comments
    const commentData = await this.commentRepository.query(
      `
      SELECT COUNT(cm.id) as "totalComments"
      FROM comments cm
      INNER JOIN courses c ON c.id = cm.course_id
      WHERE c.created_by = $1
      `,
      [instructorId],
    );
    const totalComments = parseInt(commentData[0]?.totalComments || '0');

    // Tính rating trung bình
    const ratingData = await this.courseRepository.query(
      `
      SELECT AVG(c.average_rating) as "overallRating"
      FROM courses c
      WHERE c.created_by = $1
      `,
      [instructorId],
    );
    const overallRating = parseFloat(ratingData[0]?.overallRating || '0');

    // Lấy chi tiết từng khóa học
    const coursesData = await this.courseRepository.query(
      `
      SELECT 
        c.id as "courseId",
        c.name as "courseName",
        c.average_rating as "averageRating",
        COUNT(DISTINCT e.user_id) as "studentCount",
        COUNT(DISTINCT cm.id) as "commentCount"
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN comments cm ON cm.course_id = c.id
      WHERE c.created_by = $1
      GROUP BY c.id, c.name, c.average_rating
      `,
      [instructorId],
    );

    // Tính revenue cho từng khóa học
    const courseRevenues = await this.orderDetailRepository.query(
      `
      SELECT 
        c.id as "courseId",
        SUM(od.price) as revenue
      FROM detail_orders od
      INNER JOIN courses c ON c.id = od.course_id
      INNER JOIN orders o ON o.id = od.order_id
      WHERE c.created_by = $1 AND o.status = $2
      GROUP BY c.id
      `,
      [instructorId, OrderStatus.COMPLETED],
    );

    const revenueMap = new Map(
      courseRevenues.map((r: any) => [r.courseId, parseFloat(r.revenue || '0')]),
    );

    const courses: InstructorCourseDto[] = coursesData.map((course: any) => ({
      courseId: course.courseId,
      courseName: course.courseName,
      studentCount: parseInt(course.studentCount || '0'),
      revenue: revenueMap.get(course.courseId) || 0,
      averageRating: parseFloat(course.averageRating || '0'),
      commentCount: parseInt(course.commentCount || '0'),
    }));

    // Lấy comments gần đây
    const recentCommentsData = await this.commentRepository.query(
      `
      SELECT 
        cm.id as "commentId",
        cm.content,
        cm.rating,
        cm.created_at as "createdAt",
        u.full_name as "studentName",
        c.name as "courseName"
      FROM comments cm
      INNER JOIN courses c ON c.id = cm.course_id
      LEFT JOIN users u ON u.id = cm.user_id
      WHERE c.created_by = $1
      ORDER BY cm.created_at DESC
      LIMIT 10
      `,
      [instructorId],
    );

    const recentComments: RecentCommentDto[] = recentCommentsData.map((comment: any) => ({
      commentId: comment.commentId,
      content: comment.content,
      studentName: comment.studentName || 'Unknown',
      courseName: comment.courseName || 'Unknown',
      rating: parseFloat(comment.rating || '0'),
      createdAt: comment.createdAt,
    }));

    return {
      totalCourses,
      totalStudents,
      totalRevenue,
      totalComments,
      overallRating: Math.round(overallRating * 10) / 10,
      courses,
      recentComments,
    };
  }
}
