import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database/data-source';
import { User, UserRole } from '../app/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function createTestUsers() {
  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [User],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    const userRepository = dataSource.getRepository(User);

    // 1. Create regular user
    const existingUser = await userRepository.findOne({
      where: { email: 'testuser@wishzy.com' },
    });

    if (existingUser) {
      console.log('⏭️  Test user already exists, skipping...');
    } else {
      const hashedPassword = await bcrypt.hash('Password@123', 10);
      // Use raw query to bypass entity hooks that try to hash again
      await dataSource.query(
        `INSERT INTO users (email, full_name, password, role, verified, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        ['testuser@wishzy.com', 'Test User', hashedPassword, UserRole.USER, true]
      );
      console.log('✅ Created test user:');
      console.log(`   Email: testuser@wishzy.com`);
      console.log(`   Password: Password@123`);
      console.log(`   Role: user\n`);
    }

    // 2. Create instructor (approved instructor)
    const existingInstructor = await userRepository.findOne({
      where: { email: 'instructor@wishzy.com' },
    });

    if (existingInstructor) {
      console.log('⏭️  Test instructor already exists, skipping...');
    } else {
      const hashedPassword = await bcrypt.hash('Password@123', 10);
      // Use raw query to bypass entity hooks that try to hash again
      await dataSource.query(
        `INSERT INTO users (email, full_name, password, role, verified, is_instructor_active, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        ['instructor@wishzy.com', 'Test Instructor', hashedPassword, UserRole.INSTRUCTOR, true, false]
      );
      console.log('✅ Created test instructor:');
      console.log(`   Email: instructor@wishzy.com`);
      console.log(`   Password: Password@123`);
      console.log(`   Role: instructor\n`);
    }

    console.log('=====================================');
    console.log('🎉 Test accounts created successfully!');
    console.log('=====================================');
    console.log('\n📋 Account Information:');
    console.log('\n👤 Test User:');
    console.log('   Email: testuser@wishzy.com');
    console.log('   Password: Password@123');
    console.log('   Role: user');
    console.log('\n👨‍🏫 Test Instructor:');
    console.log('   Email: instructor@wishzy.com');
    console.log('   Password: Password@123');
    console.log('   Role: instructor');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to create test users:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

createTestUsers();

