/**
 * Script to create test courses with Udemy-style structure
 * Run with: npm run create:test-courses
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_URL = process.env.API_URL || 'http://localhost:8000';

// Admin credentials - change these to match your admin user
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

async function createTestCourses(quantity: number = 5) {
  console.log('🚀 Starting test course creation...\n');
  console.log(`API URL: ${API_URL}`);

  try {
    // 1. Login to get token
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginResponse.data?.data?.accessToken || loginResponse.data?.accessToken;
    if (!token) {
      throw new Error('Failed to get access token. Check admin credentials.');
    }
    console.log('✅ Login successful\n');

    // 2. Create test courses
    console.log(`📚 Creating ${quantity} test courses...`);
    const response = await axios.post(
      `${API_URL}/courses/test-create`,
      { quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const result = response.data;
    console.log('\n✅ Test courses created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📚 Courses created: ${result.data?.created || quantity}`);
    console.log(`📖 Chapters: ${result.data?.chapters}`);
    console.log(`🎬 Lectures: ${result.data?.lectures}`);
    console.log(`📝 Quizzes: ${result.data?.quizzes}`);
    console.log(`📄 Documents: ${result.data?.documents || 0}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (result.data?.stats) {
      console.log('\n📊 Course Details:');
      result.data.stats.forEach((course: any, index: number) => {
        console.log(`  ${index + 1}. ${course.name}`);
        console.log(`     - ${course.chapters} chapters, ${course.lectures} lectures, ${course.quizzes} quizzes, ${course.documents || 0} docs`);
      });
    }
  } catch (error: any) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data?.message || error.response.statusText);
      console.error('Status:', error.response.status);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

// Get quantity from command line args
const quantity = parseInt(process.argv[2]) || 5;
createTestCourses(quantity);
