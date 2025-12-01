import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { DataSource } from 'typeorm';

async function clearCoursesData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🗑️  Clearing courses data...');

    // Xóa theo thứ tự (lectures -> chapters -> courses)
    await dataSource.query('DELETE FROM lectures');
    console.log('✅ Cleared lectures');

    await dataSource.query('DELETE FROM chapters');
    console.log('✅ Cleared chapters');

    await dataSource.query('DELETE FROM courses');
    console.log('✅ Cleared courses');

    console.log('🎉 All courses data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await app.close();
  }
}

clearCoursesData();
