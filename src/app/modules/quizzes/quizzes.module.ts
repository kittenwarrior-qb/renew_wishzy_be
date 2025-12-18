import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { QuizAttemptsService } from './quiz-attempts.service';
import { QuizAttemptsController } from './quiz-attempts.controller';
import { Quiz } from '../../entities/quiz.entity';
import { Question } from '../../entities/question.entity';
import { AnswerOption } from '../../entities/answer-option.entity';
import { QuizAttempt } from '../../entities/quiz-attempt.entity';
import { UserAnswer } from '../../entities/user-answer.entity';
import { Lecture } from '../../entities/lecture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, AnswerOption, QuizAttempt, UserAnswer, Lecture])],
  controllers: [QuizzesController, QuizAttemptsController],
  providers: [QuizzesService, QuizAttemptsService],
  exports: [QuizzesService, QuizAttemptsService],
})
export class QuizzesModule {}
