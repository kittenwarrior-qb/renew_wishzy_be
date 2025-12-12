import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { seedQuizzes } from './quiz.seeder';

// Import entities
import { User } from '../../app/entities/user.entity';
import { Quiz } from '../../app/entities/quiz.entity';
import { Question } from '../../app/entities/question.entity';
import { AnswerOption } from '../../app/entities/answer-option.entity';
import { QuizAttempt } from '../../app/entities/quiz-attempt.entity';
import { UserAnswer } from '../../app/entities/user-answer.entity';

async function runQuizSeed() {
  console.log('🎯 Starting quiz seeding only...');
  console.log('=====================================\n');

  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [
      User,
      Quiz,
      Question,
      AnswerOption,
      QuizAttempt,
      UserAnswer,
    ],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    console.log('📝 Seeding quizzes...');
    await seedQuizzes(dataSource);
    console.log('');

    console.log('=====================================');
    console.log('🎉 Quiz seeding completed successfully!');
    console.log('=====================================');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runQuizSeed();
