import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedSimpleQuizzes } from './quiz-simple.seeder';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'wishzy_db',
  entities: ['src/app/entities/*.entity.ts'],
  synchronize: false,
});

async function runSeed() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected');

    await seedSimpleQuizzes(dataSource);

    await dataSource.destroy();
    console.log('✅ Seed completed successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
