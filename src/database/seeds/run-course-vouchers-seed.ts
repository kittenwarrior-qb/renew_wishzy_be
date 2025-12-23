import { DataSource } from 'typeorm';
import { seedCourseVouchers100K } from './voucher.seeder';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'wishzy_db',
  entities: ['src/app/entities/*.entity.ts'],
  synchronize: false,
});

async function runSeed() {
  try {
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected!');

    console.log('\n🎫 Generating -100K vouchers for all courses...');
    await seedCourseVouchers100K(dataSource);

    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    process.exit(0);
  }
}

runSeed();
