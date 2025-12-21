/**
 * Script to clear all course-related data for testing purposes
 * Run with: npm run clear:courses
 *
 * WARNING: This will DELETE all data from course-related tables
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function tableExists(dataSource: DataSource, tableName: string): Promise<boolean> {
  const result = await dataSource.query(
    `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
    [tableName],
  );
  return result[0]?.exists || false;
}

async function safeDelete(
  dataSource: DataSource,
  tableName: string,
  condition?: string,
): Promise<number> {
  const exists = await tableExists(dataSource, tableName);
  if (!exists) {
    return -1;
  }

  const query = condition
    ? `DELETE FROM ${tableName} WHERE ${condition}`
    : `DELETE FROM ${tableName}`;
  const result = await dataSource.query(query);
  return result[1] || 0;
}

async function clearCoursesData() {
  console.log('🚀 Starting course data cleanup...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'wishzy',
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    const logResult = (name: string, count: number) => {
      if (count === -1) {
        console.log(`   - ${name}: (table not found, skipped)`);
      } else {
        console.log(`   - ${name}: ${count} rows deleted`);
      }
    };

    console.log('🗑️  Deleting quiz-related data...');
    logResult('user_answers', await safeDelete(dataSource, 'user_answers'));
    logResult('quiz_attempts', await safeDelete(dataSource, 'quiz_attempts'));
    logResult('answer_options', await safeDelete(dataSource, 'answer_options'));
    logResult('questions', await safeDelete(dataSource, 'questions'));
    logResult('quizzes', await safeDelete(dataSource, 'quizzes'));

    console.log('\n🗑️  Deleting lecture-related data...');
    logResult('lecture_notes', await safeDelete(dataSource, 'lecture_notes'));
    logResult('documents', await safeDelete(dataSource, 'documents'));
    logResult(
      'comments (lecture)',
      await safeDelete(dataSource, 'comments', 'lecture_id IS NOT NULL'),
    );
    logResult('lectures', await safeDelete(dataSource, 'lectures'));

    console.log('\n🗑️  Deleting chapter data...');
    logResult('chapters', await safeDelete(dataSource, 'chapters'));

    console.log('\n🗑️  Deleting course-related data...');
    logResult('comments', await safeDelete(dataSource, 'comments'));
    logResult('feedbacks', await safeDelete(dataSource, 'feedbacks'));
    logResult('wishlists', await safeDelete(dataSource, 'wishlists'));
    logResult('enrollments', await safeDelete(dataSource, 'enrollments'));
    logResult('order_details', await safeDelete(dataSource, 'order_details'));
    logResult('orders', await safeDelete(dataSource, 'orders'));

    console.log('\n🗑️  Deleting courses...');
    logResult('courses', await safeDelete(dataSource, 'courses'));

    console.log('\n✅ All course data cleared successfully!');
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
clearCoursesData();
