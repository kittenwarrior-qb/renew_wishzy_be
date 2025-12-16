import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database/data-source';
import { seedDocuments } from '../database/seeds/documents.seeder';

// Import entities
import { User } from '../app/entities/user.entity';
import { Category } from '../app/entities/category.entity';
import { Course } from '../app/entities/course.entity';
import { Chapter } from '../app/entities/chapter.entity';
import { Lecture } from '../app/entities/lecture.entity';
import { Comment } from '../app/entities/comment.entity';
import { Feedback } from '../app/entities/feedback.entity';
import { Document } from '../app/entities/document.entity';

async function runDocumentsSeeds() {
  console.log('🌱 Starting documents seeding...');

  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [User, Category, Course, Chapter, Lecture, Comment, Feedback, Document],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    await seedDocuments(dataSource);
    console.log('🎉 Documents seeding completed!');
    console.log('🔗 Test at: http://localhost:3000/instructor/documents');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database closed');
    }
  }
}

// Run the seeder
runDocumentsSeeds();