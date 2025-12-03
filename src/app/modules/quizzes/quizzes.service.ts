import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from '../../entities/quiz.entity';
import { Question } from '../../entities/question.entity';
import { AnswerOption } from '../../entities/answer-option.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(AnswerOption)
    private readonly answerOptionRepository: Repository<AnswerOption>,
  ) {}

  async create(createQuizDto: CreateQuizDto, creatorId: string): Promise<Quiz> {
    const { questions, ...quizData } = createQuizDto;

    console.log(JSON.stringify(createQuizDto));

    // Validate questions
    questions.forEach((question, index) => {
      const correctAnswers = question.answerOptions.filter((opt) => opt.isCorrect);
      if (correctAnswers.length === 0) {
        throw new BadRequestException(
          `Question ${index + 1} must have at least one correct answer`,
        );
      }
    });

    const quiz = this.quizRepository.create({
      ...quizData,
      creatorId,
    });

    const savedQuiz = await this.quizRepository.save(quiz);

    // Create questions with answer options
    for (let i = 0; i < questions.length; i++) {
      const questionData = questions[i];
      const question = this.questionRepository.create({
        ...questionData,
        quizId: savedQuiz.id,
        orderIndex: i,
      });

      const savedQuestion = await this.questionRepository.save(question);

      // Create answer options
      for (let j = 0; j < questionData.answerOptions.length; j++) {
        const optionData = questionData.answerOptions[j];
        await this.answerOptionRepository
          .createQueryBuilder()
          .insert()
          .into(AnswerOption)
          .values({
            questionId: savedQuestion.id,
            orderIndex: j,
            optionText: optionData.optionText,
            isCorrect: optionData.isCorrect,
          })
          .execute();
      }
    }

    return this.findOne(savedQuiz.id);
  }

  async findAll(page: number = 1, limit: number = 10, isPublic?: boolean) {
    const query = this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.creator', 'creator')
      .leftJoinAndSelect('quiz.questions', 'questions')
      .orderBy('quiz.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (isPublic !== undefined) {
      query.where('quiz.isPublic = :isPublic', { isPublic });
    }

    const [quizzes, total] = await query.getManyAndCount();

    return {
      data: quizzes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['creator', 'questions', 'questions.answerOptions'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async findOneForTaking(id: string): Promise<any> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['creator', 'questions', 'questions.answerOptions'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // Remove isCorrect field from answer options to prevent cheating
    const sanitizedQuiz = {
      ...quiz,
      questions: quiz.questions.map((question) => ({
        ...question,
        answerOptions: question.answerOptions.map((option) => ({
          id: option.id,
          questionId: option.questionId,
          optionText: option.optionText,
          orderIndex: option.orderIndex,
          // isCorrect is intentionally omitted
        })),
      })),
    };

    return sanitizedQuiz;
  }

  async findByCreator(creatorId: string): Promise<Quiz[]> {
    return this.quizRepository.find({
      where: { creatorId },
      relations: ['questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateQuizDto: UpdateQuizDto,
    userId: string,
    userRole: string,
  ): Promise<Quiz> {
    // Don't load questions to avoid cascade update issues
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // Admin can update any quiz, instructors can only update their own quizzes
    const isAdmin = userRole === 'admin';
    const isOwner = quiz.creatorId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have permission to update this quiz');
    }

    const { questions, ...quizData } = updateQuizDto;

    // Validate questions if provided (same validation as create)
    if (questions) {
      questions.forEach((question, index) => {
        const correctAnswers = question.answerOptions.filter((opt) => opt.isCorrect);
        if (correctAnswers.length === 0) {
          throw new BadRequestException(
            `Question ${index + 1} must have at least one correct answer`,
          );
        }
      });

      // Delete all existing questions (cascade will delete answer options)
      await this.questionRepository.delete({ quizId: id });

      // Create new questions with answer options (same logic as create)
      for (let i = 0; i < questions.length; i++) {
        const questionData = questions[i];
        const { quizId: _, answerOptions, ...cleanQuestionData } = questionData;

        console.log('Creating question:', { cleanQuestionData, quizId: id, orderIndex: i });

        const question = this.questionRepository.create({
          questionText: cleanQuestionData.questionText,
          points: cleanQuestionData.points,
          quizId: id,
          orderIndex: i,
        });

        const savedQuestion = await this.questionRepository.save(question);

        // Create answer options
        for (let j = 0; j < answerOptions.length; j++) {
          const optionData = answerOptions[j];
          await this.answerOptionRepository
            .createQueryBuilder()
            .insert()
            .into(AnswerOption)
            .values({
              questionId: savedQuestion.id,
              orderIndex: j,
              optionText: optionData.optionText,
              isCorrect: optionData.isCorrect,
            })
            .execute();
        }
      }
    }

    // Update quiz metadata (only update quiz fields, not questions)
    if (Object.keys(quizData).length > 0) {
      Object.assign(quiz, quizData);
      await this.quizRepository.save(quiz);
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const quiz = await this.findOne(id);

    // Admin can delete any quiz, instructors can only delete their own quizzes
    const isAdmin = userRole === 'admin';
    const isOwner = quiz.creatorId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have permission to delete this quiz');
    }

    await this.quizRepository.remove(quiz);
  }

  async checkOwnership(quizId: string, userId: string): Promise<boolean> {
    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    return quiz?.creatorId === userId;
  }

  async checkAccess(quizId: string, userId: string): Promise<boolean> {
    const quiz = await this.findOne(quizId);

    if (quiz.isPublic && quiz.isFree) {
      return true;
    }

    if (quiz.creatorId === userId) {
      return true;
    }

    // TODO: Check payment status for paid quizzes
    return false;
  }

  async generateShareLink(quizId: string): Promise<string> {
    const quiz = await this.findOne(quizId);
    await this.quizRepository.increment({ id: quizId }, 'shareCount', 1);

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/quizzes/${quiz.id}`;
  }

  async findOneForAdmin(id: string, userId: string, userRole: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['creator', 'questions', 'questions.answerOptions'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // Admin can view any quiz, instructors can only view their own quizzes
    const isAdmin = userRole === 'admin';
    const isOwner = quiz.creatorId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have permission to view this quiz details');
    }

    // Sort questions by orderIndex and answer options by orderIndex
    if (quiz.questions) {
      quiz.questions.sort((a, b) => a.orderIndex - b.orderIndex);
      quiz.questions.forEach((question) => {
        if (question.answerOptions) {
          question.answerOptions.sort((a, b) => a.orderIndex - b.orderIndex);
        }
      });
    }

    return quiz;
  }
}
