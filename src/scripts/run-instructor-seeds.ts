import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database/data-source';
import { seedInstructorData } from '../database/seeds/instructor-data.seeder';

// Import entities
import { User } from '../app/entities/user.entity';
import { Category } from '../app/entities/category.entity';
import { Course } from '../app/entities/course.entity';
import { Chapter } from '../app/entities/chapter.entity';
import { Lecture } from '../app/entities/lecture.entity';
import { Comment } from '../app/entities/comment.entity';
import { Feedback } from '../app/entities/feedback.entity';

async function runInstructorSeeder() {
  console.log('🌱 Starting instructor data seeding...');
  console.log('=====================================\n');

  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [
      User,
      Category,
      Course,
      Chapter,
      Lecture,
      Comment,
      Feedback,
    ],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    console.log('📝 Seeding instructor data for instructor1...');
    await seedInstructorData(dataSource);
    console.log('');

    console.log('=====================================');
    console.log('🎉 Instructor data seeding completed!');
    console.log('=====================================');
    console.log('\n💡 This seeder creates:');
    console.log('   - 1 React Native course for instructor1');
    console.log('   - 3 chapters');
    console.log('   - 5 lectures with videos');
    console.log('   - 15-25 comments from students');
    console.log('   - 8 instructor replies');
    console.log('   - 15 course feedbacks');
  } catch (error) {
    console.error('❌ Instructor seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runInstructorSeeder();
