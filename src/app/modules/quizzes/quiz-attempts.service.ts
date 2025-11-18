import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from '../../entities/quiz-attempt.entity';
import { UserAnswer } from '../../entities/user-answer.entity';
import { Quiz } from '../../entities/quiz.entity';
import { Question } from '../../entities/question.entity';
import { AnswerOption } from '../../entities/answer-option.entity';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { AttemptStatus } from '../../entities/enums/attempt-status.enum';

@Injectable()
export class QuizAttemptsService {
  constructor(
    @InjectRepository(QuizAttempt)
    private readonly attemptRepository: Repository<QuizAttempt>,
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepository: Repository<UserAnswer>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(AnswerOption)
    private readonly answerOptionRepository: Repository<AnswerOption>,
  ) {}

  async startAttempt(quizId: string, userId: string): Promise<QuizAttempt> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['questions'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // TODO: Check payment for paid quizzes

    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    const attempt = this.attemptRepository.create({
      quizId,
      userId,
      startedAt: new Date(),
      maxScore,
      status: AttemptStatus.IN_PROGRESS,
    });

    const savedAttempt = await this.attemptRepository.save(attempt);

    // Increment total attempts
    await this.quizRepository.increment({ id: quizId }, 'totalAttempts', 1);

    return savedAttempt;
  }

  async submitAnswer(
    attemptId: string,
    answerDto: SubmitAnswerDto,
    userId: string,
  ): Promise<UserAnswer> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have permission to submit answers for this attempt');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('This quiz attempt has already been completed');
    }

    // Check if answer already exists
    const existingAnswer = await this.userAnswerRepository.findOne({
      where: {
        attemptId,
        questionId: answerDto.questionId,
      },
    });

    if (existingAnswer) {
      throw new BadRequestException('Answer for this question has already been submitted');
    }

    // Validate answer
    const question = await this.questionRepository.findOne({
      where: { id: answerDto.questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const selectedOption = await this.answerOptionRepository.findOne({
      where: { id: answerDto.selectedOptionId },
    });

    if (!selectedOption || selectedOption.questionId !== answerDto.questionId) {
      throw new BadRequestException('Invalid answer option');
    }

    const isCorrect = selectedOption.isCorrect;
    const pointsEarned = isCorrect ? question.points : 0;

    const userAnswer = this.userAnswerRepository.create({
      attemptId,
      questionId: answerDto.questionId,
      selectedOptionId: answerDto.selectedOptionId,
      isCorrect,
      pointsEarned,
      answeredAt: new Date(),
    });

    return this.userAnswerRepository.save(userAnswer);
  }

  async completeAttempt(attemptId: string, userId: string): Promise<QuizAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['userAnswers', 'quiz', 'quiz.questions'],
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have permission to complete this attempt');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('This quiz attempt has already been completed');
    }

    // Calculate score
    const totalScore = attempt.userAnswers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    const percentage = attempt.maxScore > 0 ? (totalScore / attempt.maxScore) * 100 : 0;

    attempt.totalScore = totalScore;
    attempt.percentage = Number(percentage.toFixed(2));
    attempt.completedAt = new Date();
    attempt.status = AttemptStatus.COMPLETED;

    return this.attemptRepository.save(attempt);
  }

  async getUserAttempts(userId: string): Promise<QuizAttempt[]> {
    return this.attemptRepository.find({
      where: { userId },
      relations: ['quiz'],
      order: { startedAt: 'DESC' },
    });
  }

  async getAttemptDetails(attemptId: string, userId: string): Promise<any> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['quiz', 'userAnswers', 'userAnswers.question', 'userAnswers.selectedOption'],
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this attempt');
    }

    // If quiz is still in progress, hide correct/incorrect information
    if (attempt.status === AttemptStatus.IN_PROGRESS) {
      return {
        ...attempt,
        userAnswers: attempt.userAnswers.map((answer) => ({
          id: answer.id,
          attemptId: answer.attemptId,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          answeredAt: answer.answeredAt,
          // Hide isCorrect and pointsEarned while in progress
        })),
      };
    }

    return attempt;
  }

  async getAttemptResults(attemptId: string, userId: string) {
    const attempt = await this.getAttemptDetails(attemptId, userId);

    if (attempt.status !== AttemptStatus.COMPLETED) {
      throw new BadRequestException('Quiz attempt is not completed yet');
    }

    const quiz = await this.quizRepository.findOne({
      where: { id: attempt.quizId },
      relations: ['questions', 'questions.answerOptions'],
    });

    const results = quiz.questions.map((question) => {
      const userAnswer = attempt.userAnswers.find((ua) => ua.questionId === question.id);
      const correctOption = question.answerOptions.find((opt) => opt.isCorrect);

      return {
        question: question.questionText,
        points: question.points,
        userAnswer: userAnswer?.selectedOption.optionText || 'Not answered',
        correctAnswer: correctOption?.optionText,
        isCorrect: userAnswer?.isCorrect || false,
        pointsEarned: userAnswer?.pointsEarned || 0,
      };
    });

    return {
      attempt: {
        id: attempt.id,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
      },
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
      },
      results,
    };
  }
}
