import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatService } from './stat.service';
import { Enrollment } from '../../entities/enrollment.entity';
import { Course } from '../../entities/course.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { Feedback } from '../../entities/feedback.entity';
import { User, UserRole } from '../../entities/user.entity';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { RevenueMode } from './dto/revenue-query.dto';

describe('StatService - Revenue Calculation', () => {
  let service: StatService;
  let orderDetailRepository: Repository<OrderDetail>;
  let systemSettingsService: SystemSettingsService;

  const mockQueryBuilder = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Course),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderDetail),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Feedback),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            query: jest.fn(),
          },
        },
        {
          provide: SystemSettingsService,
          useValue: {
            getInstructorRevenuePercentage: jest.fn().mockResolvedValue(70), // 70% for instructor
            getSystemRevenuePercentage: jest.fn().mockResolvedValue(30), // 30% for admin
          },
        },
      ],
    }).compile();

    service = module.get<StatService>(StatService);
    orderDetailRepository = module.get<Repository<OrderDetail>>(getRepositoryToken(OrderDetail));
    systemSettingsService = module.get<SystemSettingsService>(SystemSettingsService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('getRevenue - Admin Revenue Calculation', () => {
    it('should calculate correct admin revenue for instructor-owned courses (70/30 split)', async () => {
      // Setup: 300k course from instructor
      // Expected: Instructor gets 210k (70%), Admin gets 90k (30%)
      const instructorCourseRevenue = 300000;
      const expectedInstructorShare = 210000;
      const expectedAdminShare = 90000;

      // Mock the main revenue query (all courses)
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { period: '2024-12', revenue: instructorCourseRevenue.toString(), orderCount: '1' }
      ]);

      // Mock enrollment count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '10' });

      // Mock courses count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '1' });

      // Mock instructor courses revenue query (for admin view)
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: instructorCourseRevenue.toString() });

      // Mock admin courses revenue query (for admin view)
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: '0' });

      const result = await service.getRevenue(
        { mode: RevenueMode.MONTH },
        undefined, // no instructorId (viewing all)
        true // isAdmin
      );

      expect(result.totalRevenue).toBe(expectedAdminShare); // Admin gets 90k
      expect(result.grossRevenue).toBe(instructorCourseRevenue); // Total is 300k
      expect(result.instructorRevenue).toBe(expectedInstructorShare); // Instructor gets 210k
      expect(result.systemRevenue).toBe(expectedAdminShare); // System/Admin gets 90k
    });

    it('should give 100% revenue to admin for admin-owned courses', async () => {
      // Setup: 300k course from admin
      // Expected: Admin gets 300k (100%)
      const adminCourseRevenue = 300000;

      // Mock the main revenue query (all courses)
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { period: '2024-12', revenue: adminCourseRevenue.toString(), orderCount: '1' }
      ]);

      // Mock enrollment count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '5' });

      // Mock courses count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '1' });

      // Mock instructor courses revenue query (for admin view) - no instructor courses
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: '0' });

      // Mock admin courses revenue query (for admin view) - all from admin
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: adminCourseRevenue.toString() });

      const result = await service.getRevenue(
        { mode: RevenueMode.MONTH },
        undefined,
        true
      );

      expect(result.totalRevenue).toBe(adminCourseRevenue); // Admin gets 300k
      expect(result.grossRevenue).toBe(adminCourseRevenue); // Total is 300k
      expect(result.systemRevenue).toBe(adminCourseRevenue); // System/Admin gets 300k
      expect(result.instructorRevenue).toBe(0); // No instructor courses
    });

    it('should correctly calculate mixed revenue (instructor + admin courses)', async () => {
      // Setup: 300k from instructor course + 500k from admin course
      // Expected: 
      // - Admin gets: 90k (30% of instructor) + 500k (100% of admin) = 590k
      // - Instructor gets: 210k (70% of instructor)
      const instructorCourseRevenue = 300000;
      const adminCourseRevenue = 500000;
      const totalRevenue = instructorCourseRevenue + adminCourseRevenue;
      
      const expectedInstructorShare = 210000; // 70% of 300k
      const expectedAdminShare = 90000 + 500000; // 30% of 300k + 100% of 500k = 590k

      // Mock the main revenue query (all courses combined)
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { period: '2024-12', revenue: totalRevenue.toString(), orderCount: '2' }
      ]);

      // Mock enrollment count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '15' });

      // Mock courses count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '2' });

      // Mock instructor courses revenue query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: instructorCourseRevenue.toString() });

      // Mock admin courses revenue query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: adminCourseRevenue.toString() });

      const result = await service.getRevenue(
        { mode: RevenueMode.MONTH },
        undefined,
        true
      );

      expect(result.totalRevenue).toBe(expectedAdminShare); // Admin gets 590k
      expect(result.grossRevenue).toBe(totalRevenue); // Total is 800k
      expect(result.instructorRevenue).toBe(expectedInstructorShare); // Instructor gets 210k
      expect(result.systemRevenue).toBe(expectedAdminShare); // System/Admin gets 590k
    });

    it('should calculate instructor revenue correctly when viewing as instructor', async () => {
      // Setup: Instructor viewing their own revenue
      const instructorCourseRevenue = 300000;
      const expectedInstructorShare = 210000; // 70%
      const expectedAdminShare = 90000; // 30%

      // Mock the main revenue query
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { period: '2024-12', revenue: instructorCourseRevenue.toString(), orderCount: '1' }
      ]);

      // Mock enrollment count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '10' });

      // Mock courses count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '1' });

      const result = await service.getRevenue(
        { mode: RevenueMode.MONTH },
        'instructor-uuid', // instructorId
        false // not admin
      );

      expect(result.totalRevenue).toBe(expectedInstructorShare); // Instructor gets 210k
      expect(result.grossRevenue).toBe(instructorCourseRevenue); // Total is 300k
      expect(result.instructorRevenue).toBe(expectedInstructorShare); // 210k
      expect(result.systemRevenue).toBe(expectedAdminShare); // 90k
    });

    it('should handle zero revenue correctly', async () => {
      // Mock the main revenue query - no sales
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);

      // Mock enrollment count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '0' });

      // Mock courses count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '0' });

      // Mock instructor courses revenue query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: '0' });

      // Mock admin courses revenue query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: '0' });

      const result = await service.getRevenue(
        { mode: RevenueMode.MONTH },
        undefined,
        true
      );

      expect(result.totalRevenue).toBe(0);
      expect(result.grossRevenue).toBe(0);
      expect(result.instructorRevenue).toBe(0);
      expect(result.systemRevenue).toBe(0);
    });

    it('should handle date range filters correctly', async () => {
      const instructorCourseRevenue = 300000;

      // Mock the main revenue query
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { period: '2024-12', revenue: instructorCourseRevenue.toString(), orderCount: '1' }
      ]);

      // Mock enrollment count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '10' });

      // Mock courses count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '1' });

      // Mock instructor courses revenue query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: instructorCourseRevenue.toString() });

      // Mock admin courses revenue query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: '0' });

      const result = await service.getRevenue(
        { 
          mode: RevenueMode.MONTH,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        undefined,
        true
      );

      // Verify andWhere was called with date filters
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('created_at'),
        expect.any(Object)
      );

      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-12-31');
    });

    it('should calculate revenue with different percentage settings', async () => {
      // Change the revenue split to 80/20
      jest.spyOn(systemSettingsService, 'getInstructorRevenuePercentage').mockResolvedValue(80);
      
      const instructorCourseRevenue = 300000;
      const expectedInstructorShare = 240000; // 80%
      const expectedAdminShare = 60000; // 20%

      // Mock the main revenue query
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { period: '2024-12', revenue: instructorCourseRevenue.toString(), orderCount: '1' }
      ]);

      // Mock enrollment count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '10' });

      // Mock courses count query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '1' });

      // Mock instructor courses revenue query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: instructorCourseRevenue.toString() });

      // Mock admin courses revenue query
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ revenue: '0' });

      const result = await service.getRevenue(
        { mode: RevenueMode.MONTH },
        undefined,
        true
      );

      expect(result.totalRevenue).toBe(expectedAdminShare); // Admin gets 60k
      expect(result.instructorRevenue).toBe(expectedInstructorShare); // Instructor gets 240k
      expect(result.instructorPercentage).toBe(80);
    });
  });
});
