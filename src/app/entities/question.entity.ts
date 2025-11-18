import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import type { Quiz } from './quiz.entity';
import type { AnswerOption } from './answer-option.entity';
import type { UserAnswer } from './user-answer.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'quiz_id' })
  quizId: string;

  @Column({ type: 'text', name: 'question_text' })
  questionText: string;

  @Column({ type: 'int', name: 'order_index' })
  orderIndex: number;

  @Column({ type: 'int', default: 1 })
  points: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Quiz', (quiz: Quiz) => quiz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @OneToMany('AnswerOption', (option: AnswerOption) => option.question, { cascade: true })
  answerOptions: AnswerOption[];

  @OneToMany('UserAnswer', (answer: UserAnswer) => answer.question)
  userAnswers: UserAnswer[];
}
