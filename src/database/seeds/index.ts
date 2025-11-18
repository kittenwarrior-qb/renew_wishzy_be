import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { seedCourses } from './course.seeder';
import { seedUsers } from './user.seeder';
import { seedQuizzes } from './quiz.seeder';
import { Course } from '../../app/entities/course.entity';
import { Category } from '../../app/entities/category.entity';
import { User } from '../../app/entities/user.entity';
import { Chapter } from '../../app/entities/chapter.entity';
import { Quiz } from '../../app/entities/quiz.entity';
import { Question } from '../../app/entities/question.entity';
import { AnswerOption } from '../../app/entities/answer-option.entity';
import { QuizAttempt } from '../../app/entities/quiz-attempt.entity';
import { UserAnswer } from '../../app/entities/user-answer.entity';

async function runSeeders() {
  console.log('🌱 Starting database seeding...');

  // Add entities to dataSource options
  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [
      Course,
      Category,
      User,
      Chapter,
      Quiz,
      Question,
      AnswerOption,
      QuizAttempt,
      UserAnswer,
    ],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Run seeders in order
    await seedUsers(dataSource);
    await seedCourses(dataSource);
    await seedQuizzes(dataSource);

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeders();
