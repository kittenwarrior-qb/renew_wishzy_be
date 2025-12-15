import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';

// Import seeders
import { seedUsers } from './user.seeder';
import { seedCategories } from './category.seeder';
import { seedCourses } from './course.seeder';
import { seedChaptersAndLectures } from './chapter-lecture.seeder';
import { seedQuizzes } from './quiz.seeder';
import { seedBanners } from './banner.seeder';
import { seedVouchers } from './voucher.seeder';
import { seedOrdersAndEnrollments } from './order-enrollment.seeder';
import { seedComments } from './comment.seeder';
import { seedWishlists } from './wishlist.seeder';

// Import entities
import { User } from '../../app/entities/user.entity';
import { Category } from '../../app/entities/category.entity';
import { Course } from '../../app/entities/course.entity';
import { Chapter } from '../../app/entities/chapter.entity';
import { Lecture } from '../../app/entities/lecture.entity';
import { Document } from '../../app/entities/document.entity';
import { Quiz } from '../../app/entities/quiz.entity';
import { Question } from '../../app/entities/question.entity';
import { AnswerOption } from '../../app/entities/answer-option.entity';
import { QuizAttempt } from '../../app/entities/quiz-attempt.entity';
import { UserAnswer } from '../../app/entities/user-answer.entity';
import { Banner } from '../../app/entities/banner.entity';
import { Voucher } from '../../app/entities/vouchers.entity';
import { Order } from '../../app/entities/order.entity';
import { OrderDetail } from '../../app/entities/order-detail.entity';
import { Enrollment } from '../../app/entities/enrollment.entity';
import { Comment } from '../../app/entities/comment.entity';
import { Wishlist } from '../../app/entities/wishlist.entity';
import { Feedback } from '../../app/entities/feedback.entity';
import { LectureNote } from '../../app/entities/lecture-note.entity';

async function runSeeders() {
  console.log('🌱 Starting database seeding...');
  console.log('=====================================\n');

  // Add entities to dataSource options
  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [
      User,
      Category,
      Course,
      Chapter,
      Lecture,
      Document,
      Quiz,
      Question,
      AnswerOption,
      QuizAttempt,
      UserAnswer,
      Banner,
      Voucher,
      Order,
      OrderDetail,
      Enrollment,
      Comment,
      Wishlist,
      Feedback,
      LectureNote,
    ],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // Run seeders in dependency order
    console.log('📝 Seeding users...');
    await seedUsers(dataSource);
    console.log('');

    console.log('📝 Seeding categories...');
    await seedCategories(dataSource);
    console.log('');

    console.log('📝 Seeding courses...');
    await seedCourses(dataSource);
    console.log('');

    console.log('📝 Seeding chapters and lectures...');
    await seedChaptersAndLectures(dataSource);
    console.log('');

    console.log('📝 Seeding banners...');
    await seedBanners(dataSource);
    console.log('');

    console.log('📝 Seeding vouchers...');
    await seedVouchers(dataSource);
    console.log('');

    console.log('📝 Seeding orders and enrollments...');
    await seedOrdersAndEnrollments(dataSource);
    console.log('');

    console.log('📝 Seeding comments...');
    await seedComments(dataSource);
    console.log('');

    console.log('📝 Seeding wishlists...');
    await seedWishlists(dataSource);
    console.log('');

    console.log('📝 Seeding quizzes...');
    await seedQuizzes(dataSource);
    console.log('');

    console.log('=====================================');
    console.log('🎉 Seeding completed successfully!');
    console.log('=====================================');
    console.log('\n📊 Summary:');
    console.log('- Users: 33 (2 admins, 10 instructors, 21 students)');
    console.log('- Categories: 18 diverse categories');
    console.log('- Courses: 30 courses with real images');
    console.log('- Chapters: 4-5 chapters per course with video lectures');
    console.log('- Lectures: 3-4 lectures per chapter with MP4 video URLs');
    console.log('- Banners: 7 promotional banners');
    console.log('- Vouchers: 15 discount vouchers');
    console.log('- Orders: ~70 orders with varying statuses');
    console.log('- Enrollments: Auto-generated from completed orders');
    console.log('- Comments: 100 realistic Vietnamese reviews');
    console.log('- Wishlists: One per user with 2-8 courses');
    console.log('- Quizzes: From existing quiz seeder');
    console.log('');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeders();
