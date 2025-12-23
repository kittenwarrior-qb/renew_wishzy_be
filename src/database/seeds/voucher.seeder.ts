import { DataSource } from 'typeorm';
import { Voucher, DiscountType, ApplyScope } from '../../app/entities/vouchers.entity';

export async function seedVouchers(dataSource: DataSource) {
  const voucherRepository = dataSource.getRepository(Voucher);

  // Check if vouchers already exist
  const existingCount = await voucherRepository.count();
  if (existingCount > 0) {
    console.log('⏭️  Seed vouchers already exist, skipping...');
    return;
  }

  // Get admin user for voucher creator
  const admin = await dataSource.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");

  if (admin.length === 0) {
    console.log('⚠️  Admin user not found. Please seed users first.');
    return;
  }

  const adminId = admin[0].id;

  // Get some categories and courses for targeted vouchers
  const categories = await dataSource.query('SELECT id FROM categories LIMIT 5');
  const courses = await dataSource.query('SELECT id FROM courses LIMIT 10');

  const now = new Date();
  const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
  const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

  const vouchers = [
    // Active site-wide vouchers
    {
      code: 'WELCOME2024',
      name: 'Chào mừng thành viên mới',
      discountValue: 15,
      discountType: 'percent',
      maxDiscountAmount: 150000,
      minOrderAmount: 299000,
      perUserLimit: 1,
      totalLimit: 1000,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },
    {
      code: 'FLASH50',
      name: 'Flash Sale - Giảm 50K',
      discountValue: 50000,
      discountType: 'fixed',
      maxDiscountAmount: null,
      minOrderAmount: 500000,
      perUserLimit: 1,
      totalLimit: 50,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },
    {
      code: 'BLACKFRIDAY',
      name: 'Black Friday Sale',
      discountValue: 40,
      discountType: 'percent',
      maxDiscountAmount: 500000,
      minOrderAmount: 799000,
      perUserLimit: 3,
      totalLimit: 200,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },
    {
      code: 'NEWYEAR2024',
      name: 'Đón năm mới 2024',
      discountValue: 20,
      discountType: 'percent',
      maxDiscountAmount: 200000,
      minOrderAmount: 400000,
      perUserLimit: 2,
      totalLimit: 500,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },

    // Category-specific vouchers
    {
      code: 'WEBDEV30',
      name: 'Giảm giá khóa học Web Development',
      discountValue: 30,
      discountType: 'percent',
      maxDiscountAmount: 300000,
      minOrderAmount: 500000,
      perUserLimit: 1,
      totalLimit: 100,
      applyScope: 'category',
      categoryId: categories.length > 0 ? categories[0].id : null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },
    {
      code: 'MOBILE25',
      name: 'Ưu đãi Mobile Development',
      discountValue: 25,
      discountType: 'percent',
      maxDiscountAmount: 250000,
      minOrderAmount: 600000,
      perUserLimit: 2,
      totalLimit: 150,
      applyScope: 'category',
      categoryId: categories.length > 1 ? categories[1].id : null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },

    // Course-specific vouchers
    {
      code: 'REACTJS50K',
      name: 'Giảm 50K cho khóa ReactJS',
      discountValue: 50000,
      discountType: 'fixed',
      maxDiscountAmount: null,
      minOrderAmount: 400000,
      perUserLimit: 1,
      totalLimit: 50,
      applyScope: 'course',
      categoryId: null,
      courseId: courses.length > 0 ? courses[0].id : null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },
    {
      code: 'NEXTJS40',
      name: 'Ưu đãi Next.js framework',
      discountValue: 40,
      discountType: 'percent',
      maxDiscountAmount: 300000,
      minOrderAmount: 500000,
      perUserLimit: 1,
      totalLimit: 75,
      applyScope: 'course',
      categoryId: null,
      courseId: courses.length > 1 ? courses[1].id : null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },

    // High-value vouchers (limited quantity)
    {
      code: 'PREMIUM100',
      name: 'Voucher Premium - Giảm 100K',
      discountValue: 100000,
      discountType: 'fixed',
      maxDiscountAmount: null,
      minOrderAmount: 1000000,
      perUserLimit: 1,
      totalLimit: 20,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },
    {
      code: 'VIP200K',
      name: 'VIP Member - Giảm 200K',
      discountValue: 200000,
      discountType: 'fixed',
      maxDiscountAmount: null,
      minOrderAmount: 1500000,
      perUserLimit: 1,
      totalLimit: 10,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },

    // Inactive/expired vouchers (for testing)
    {
      code: 'EXPIRED2023',
      name: 'Voucher đã hết hạn',
      discountValue: 30,
      discountType: 'percent',
      maxDiscountAmount: 300000,
      minOrderAmount: 500000,
      perUserLimit: 1,
      totalLimit: 100,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: false,
      startDate: pastDate,
      endDate: now,
      userId: adminId,
    },
    {
      code: 'INACTIVE10',
      name: 'Voucher tạm dừng',
      discountValue: 10,
      discountType: 'percent',
      maxDiscountAmount: 100000,
      minOrderAmount: 300000,
      perUserLimit: 1,
      totalLimit: 100,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: false,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },

    // Small discount vouchers
    {
      code: 'SAVE10K',
      name: 'Tiết kiệm 10K',
      discountValue: 10000,
      discountType: 'fixed',
      maxDiscountAmount: null,
      minOrderAmount: 200000,
      perUserLimit: 5,
      totalLimit: 500,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },
    {
      code: 'STUDENT15',
      name: 'Ưu đãi sinh viên',
      discountValue: 15,
      discountType: 'percent',
      maxDiscountAmount: 150000,
      minOrderAmount: 300000,
      perUserLimit: 3,
      totalLimit: 300,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },
    {
      code: 'EARLYBIRD',
      name: 'Ưu đãi đăng ký sớm',
      discountValue: 25,
      discountType: 'percent',
      maxDiscountAmount: 200000,
      minOrderAmount: 450000,
      perUserLimit: 1,
      totalLimit: 100,
      applyScope: 'all',
      categoryId: null,
      courseId: null,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    },
  ];

  // Cast vouchers to fix TypeScript enum issues
  // Enums are validated at database level, so using 'as any' is safe here
  await voucherRepository.save(vouchers as any);
  console.log(`✅ Successfully seeded ${vouchers.length} vouchers!`);
}

/**
 * Generate -100K voucher for all courses
 * Each course gets a unique voucher code
 */
export async function seedCourseVouchers100K(dataSource: DataSource) {
  const voucherRepository = dataSource.getRepository(Voucher);

  // Get admin user for voucher creator
  const admin = await dataSource.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");

  if (admin.length === 0) {
    console.log('⚠️  Admin user not found. Please seed users first.');
    return;
  }

  const adminId = admin[0].id;

  // Get all courses
  const courses = await dataSource.query('SELECT id, name FROM courses');

  if (courses.length === 0) {
    console.log('⚠️  No courses found. Please seed courses first.');
    return;
  }

  const now = new Date();
  const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

  let createdCount = 0;
  let skippedCount = 0;

  for (const course of courses) {
    // Generate unique code based on course id (last 6 chars)
    const shortId = course.id.replace(/-/g, '').slice(-6).toUpperCase();
    const code = `GIAM100K_${shortId}`;

    // Check if voucher already exists
    const existing = await voucherRepository.findOne({ where: { code } });
    if (existing) {
      skippedCount++;
      continue;
    }

    const voucher = voucherRepository.create({
      code,
      name: `Giảm 100K - ${course.name.slice(0, 50)}`,
      discountValue: 100000,
      discountType: DiscountType.FIXED,
      maxDiscountAmount: null,
      minOrderAmount: 0, // No minimum
      perUserLimit: 1,
      totalLimit: 100,
      applyScope: ApplyScope.COURSE,
      categoryId: null,
      courseId: course.id,
      isActive: true,
      startDate: now,
      endDate: futureDate,
      userId: adminId,
    });

    await voucherRepository.save(voucher);
    createdCount++;
  }

  console.log(`✅ Created ${createdCount} course vouchers (-100K)`);
  if (skippedCount > 0) {
    console.log(`⏭️  Skipped ${skippedCount} existing vouchers`);
  }
}
