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
import { Lecture } from '../../entities/lecture.entity';
import { Course } from '../../entities/course.entity';
import { Enrollment } from '../../entities/enrollment.entity';
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
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
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

  /**
   * Get all quiz attempts for admin (paginated)
   */
  async getAllAttempts(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: AttemptStatus;
      quizId?: string;
      userId?: string;
    },
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const query = this.attemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.user', 'user')
      .leftJoinAndSelect('attempt.quiz', 'quiz')
      .orderBy('attempt.startedAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    if (filters?.status) {
      query.andWhere('attempt.status = :status', { status: filters.status });
    }
    if (filters?.quizId) {
      query.andWhere('attempt.quizId = :quizId', { quizId: filters.quizId });
    }
    if (filters?.userId) {
      query.andWhere('attempt.userId = :userId', { userId: filters.userId });
    }

    const [attempts, total] = await query.getManyAndCount();

    return {
      data: attempts.map((a) => ({
        id: a.id,
        quizId: a.quizId,
        userId: a.userId,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        totalScore: a.totalScore,
        maxScore: a.maxScore,
        percentage: a.percentage,
        status: a.status,
        user: a.user ? { id: a.user.id, fullName: a.user.fullName, email: a.user.email } : null,
        quiz: a.quiz ? { id: a.quiz.id, title: a.quiz.title } : null,
      })),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Get quiz attempts for instructor (only quizzes attached to their courses)
   */
  async getInstructorAttempts(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: AttemptStatus;
      quizId?: string;
    },
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    // Get all quizzes that belong to instructor:
    // 1. Quizzes created by instructor (standalone quizzes)
    // 2. Quizzes attached to lectures in courses created by instructor
    const query = this.attemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.user', 'user')
      .leftJoinAndSelect('attempt.quiz', 'quiz')
      .leftJoin('quiz.lecture', 'lecture')
      .leftJoin('lecture.chapter', 'chapter')
      .leftJoin('chapter.course', 'course')
      .where(
        '(quiz.creatorId = :instructorId OR (course.createdBy = :instructorId AND quiz.entityId IS NOT NULL))',
        { instructorId },
      )
      .orderBy('attempt.startedAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    if (filters?.status) {
      query.andWhere('attempt.status = :status', { status: filters.status });
    }
    if (filters?.quizId) {
      query.andWhere('attempt.quizId = :quizId', { quizId: filters.quizId });
    }

    const [attempts, total] = await query.getManyAndCount();

    return {
      data: attempts.map((a) => ({
        id: a.id,
        quizId: a.quizId,
        userId: a.userId,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        totalScore: a.totalScore,
        maxScore: a.maxScore,
        percentage: a.percentage,
        status: a.status,
        user: a.user ? { id: a.user.id, fullName: a.user.fullName, email: a.user.email } : null,
        quiz: a.quiz ? { id: a.quiz.id, title: a.quiz.title } : null,
      })),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Get attempt details for admin/instructor
   */
  async getAttemptDetailsForAdmin(attemptId: string, userId: string, userRole: string) {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: [
        'quiz',
        'user',
        'userAnswers',
        'userAnswers.question',
        'userAnswers.selectedOption',
      ],
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    // Check access permission
    if (userRole !== 'admin') {
      // Instructor: check if quiz belongs to them
      const quiz = await this.quizRepository.findOne({
        where: { id: attempt.quizId },
        relations: ['lecture', 'lecture.chapter', 'lecture.chapter.course'],
      });

      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }

      const isCreator = quiz.creatorId === userId;
      const isCourseOwner = quiz.lecture?.chapter?.course?.createdBy === userId;

      if (!isCreator && !isCourseOwner) {
        throw new ForbiddenException('You do not have permission to view this attempt');
      }
    }

    // Get full quiz with questions and correct answers
    const quiz = await this.quizRepository.findOne({
      where: { id: attempt.quizId },
      relations: ['questions', 'questions.answerOptions'],
    });

    const questionsWithAnswers = quiz.questions.map((question) => {
      const userAnswer = attempt.userAnswers.find((ua) => ua.questionId === question.id);
      const correctOption = question.answerOptions.find((opt) => opt.isCorrect);

      return {
        id: question.id,
        questionText: question.questionText,
        points: question.points,
        orderIndex: question.orderIndex,
        userAnswer: userAnswer
          ? {
              selectedOptionId: userAnswer.selectedOptionId,
              selectedOptionText: userAnswer.selectedOption?.optionText,
              isCorrect: userAnswer.isCorrect,
              pointsEarned: userAnswer.pointsEarned,
            }
          : null,
        correctAnswer: correctOption
          ? {
              id: correctOption.id,
              optionText: correctOption.optionText,
            }
          : null,
        answerOptions: question.answerOptions.map((opt) => ({
          id: opt.id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          orderIndex: opt.orderIndex,
        })),
      };
    });

    return {
      id: attempt.id,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      status: attempt.status,
      user: {
        id: attempt.user.id,
        fullName: attempt.user.fullName,
        email: attempt.user.email,
      },
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
      },
      questions: questionsWithAnswers,
    };
  }

  /**
   * Check if user has passed all quizzes for a lecture
   * Returns true if:
   * - Lecture has no quizzes
   * - Lecture has quizzes and user has passed all of them with required score
   */
  async checkLectureQuizCompletion(
    lectureId: string,
    userId: string,
  ): Promise<{
    passed: boolean;
    requiresQuiz: boolean;
    quizzes: Array<{
      id: string;
      title: string;
      passingScore: number;
      bestAttempt: {
        percentage: number;
        passed: boolean;
      } | null;
    }>;
  }> {
    // Get lecture with quizzes
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
      relations: ['quizzes'],
    });

    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }

    // If lecture doesn't require quiz or has no quizzes, return passed
    if (!lecture.requiresQuiz || !lecture.quizzes || lecture.quizzes.length === 0) {
      return {
        passed: true,
        requiresQuiz: false,
        quizzes: [],
      };
    }

    // Get all completed attempts for this user on lecture's quizzes
    const quizIds = lecture.quizzes.map((q) => q.id);
    const attempts = await this.attemptRepository
      .createQueryBuilder('attempt')
      .where('attempt.userId = :userId', { userId })
      .andWhere('attempt.quizId IN (:...quizIds)', { quizIds })
      .andWhere('attempt.status = :status', { status: AttemptStatus.COMPLETED })
      .orderBy('attempt.percentage', 'DESC')
      .getMany();

    // Group attempts by quizId and get best attempt for each
    const bestAttemptsByQuiz = new Map<string, QuizAttempt>();
    for (const attempt of attempts) {
      const existing = bestAttemptsByQuiz.get(attempt.quizId);
      if (!existing || attempt.percentage > existing.percentage) {
        bestAttemptsByQuiz.set(attempt.quizId, attempt);
      }
    }

    // Check if all quizzes are passed
    const quizResults = lecture.quizzes.map((quiz) => {
      const bestAttempt = bestAttemptsByQuiz.get(quiz.id);
      const passingScore = quiz.passingScore || 100;
      const passed = bestAttempt ? bestAttempt.percentage >= passingScore : false;

      return {
        id: quiz.id,
        title: quiz.title,
        passingScore,
        bestAttempt: bestAttempt
          ? {
              percentage: Number(bestAttempt.percentage),
              passed,
            }
          : null,
      };
    });

    const allPassed = quizResults.every((q) => q.bestAttempt?.passed);

    return {
      passed: allPassed,
      requiresQuiz: true,
      quizzes: quizResults,
    };
  }

  /**
   * Get quiz status for a lecture (for student view)
   */
  async getLectureQuizStatus(
    lectureId: string,
    userId: string,
  ): Promise<{
    requiresQuiz: boolean;
    quizzes: Array<{
      id: string;
      title: string;
      description?: string;
      questionCount: number;
      timeLimit?: number;
      passingScore: number;
      attempts: Array<{
        id: string;
        percentage: number;
        passed: boolean;
        completedAt: Date;
      }>;
      bestScore: number | null;
      passed: boolean;
    }>;
    allPassed: boolean;
  }> {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
      relations: ['quizzes', 'quizzes.questions'],
    });

    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }

    if (!lecture.requiresQuiz || !lecture.quizzes || lecture.quizzes.length === 0) {
      return {
        requiresQuiz: false,
        quizzes: [],
        allPassed: true,
      };
    }

    const quizIds = lecture.quizzes.map((q) => q.id);
    const attempts = await this.attemptRepository
      .createQueryBuilder('attempt')
      .where('attempt.userId = :userId', { userId })
      .andWhere('attempt.quizId IN (:...quizIds)', { quizIds })
      .andWhere('attempt.status = :status', { status: AttemptStatus.COMPLETED })
      .orderBy('attempt.completedAt', 'DESC')
      .getMany();

    const attemptsByQuiz = new Map<string, QuizAttempt[]>();
    for (const attempt of attempts) {
      const existing = attemptsByQuiz.get(attempt.quizId) || [];
      existing.push(attempt);
      attemptsByQuiz.set(attempt.quizId, existing);
    }

    const quizResults = lecture.quizzes.map((quiz) => {
      const quizAttempts = attemptsByQuiz.get(quiz.id) || [];
      const passingScore = quiz.passingScore || 100;
      const bestScore =
        quizAttempts.length > 0 ? Math.max(...quizAttempts.map((a) => Number(a.percentage))) : null;
      const passed = bestScore !== null && bestScore >= passingScore;

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.questions?.length || 0,
        timeLimit: quiz.timeLimit,
        passingScore,
        attempts: quizAttempts.map((a) => ({
          id: a.id,
          percentage: Number(a.percentage),
          passed: Number(a.percentage) >= passingScore,
          completedAt: a.completedAt,
        })),
        bestScore,
        passed,
      };
    });

    const allPassed = quizResults.every((q) => q.passed);

    return {
      requiresQuiz: true,
      quizzes: quizResults,
      allPassed,
    };
  }

  /**
   * Complete attempt and check if lecture should be marked as completed
   */
  async completeAttemptAndCheckLecture(
    attemptId: string,
    userId: string,
    enrollmentId?: string,
  ): Promise<{
    attempt: QuizAttempt;
    passed: boolean;
    lectureCompleted: boolean;
    message: string;
  }> {
    const attempt = await this.completeAttempt(attemptId, userId);

    // Get quiz to find lecture
    const quiz = await this.quizRepository.findOne({
      where: { id: attempt.quizId },
      relations: ['lecture'],
    });

    if (!quiz || !quiz.entityId || !quiz.lecture) {
      return {
        attempt,
        passed: attempt.percentage >= 100,
        lectureCompleted: false,
        message: 'Quiz completed',
      };
    }

    const passingScore = quiz.passingScore || 100;
    const passed = attempt.percentage >= passingScore;

    if (!passed) {
      return {
        attempt,
        passed: false,
        lectureCompleted: false,
        message: `Bạn cần đạt ${passingScore}% để vượt qua bài kiểm tra. Điểm của bạn: ${attempt.percentage}%`,
      };
    }

    // Check if all quizzes for this lecture are passed
    const lectureCompletion = await this.checkLectureQuizCompletion(quiz.entityId, userId);

    if (!lectureCompletion.passed) {
      return {
        attempt,
        passed: true,
        lectureCompleted: false,
        message: 'Bạn đã vượt qua bài kiểm tra này. Hãy hoàn thành các bài kiểm tra còn lại.',
      };
    }

    // All quizzes passed - mark lecture as completed if enrollmentId provided
    let lectureCompleted = false;
    if (enrollmentId) {
      try {
        const enrollment = await this.enrollmentRepository.findOne({
          where: { id: enrollmentId },
        });

        if (enrollment) {
          const finishedLectures = enrollment.attributes?.finishedLectures || [];
          if (!finishedLectures.includes(quiz.entityId)) {
            finishedLectures.push(quiz.entityId);
            enrollment.attributes = {
              ...enrollment.attributes,
              finishedLectures,
            };
            await this.enrollmentRepository.save(enrollment);
            lectureCompleted = true;
          }
        }
      } catch (error) {
        console.error('Failed to update enrollment:', error);
      }
    }

    return {
      attempt,
      passed: true,
      lectureCompleted,
      message: lectureCompleted
        ? '🎉 Chúc mừng! Bạn đã hoàn thành bài học này!'
        : 'Bạn đã vượt qua tất cả bài kiểm tra!',
    };
  }
}
