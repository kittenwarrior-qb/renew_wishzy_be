import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import type { QuizAttempt } from './quiz-attempt.entity';
import type { Question } from './question.entity';
import type { AnswerOption } from './answer-option.entity';

@Entity('user_answers')
export class UserAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'attempt_id' })
  attemptId: string;

  @Column({ type: 'uuid', name: 'question_id' })
  questionId: string;

  @Column({ type: 'uuid', name: 'selected_option_id' })
  selectedOptionId: string;

  @Column({ type: 'boolean', name: 'is_correct', default: false })
  isCorrect: boolean;

  @Column({ type: 'int', default: 0, name: 'points_earned' })
  pointsEarned: number;

  @Column({ type: 'timestamp', name: 'answered_at' })
  answeredAt: Date;

  @ManyToOne('QuizAttempt', (attempt: QuizAttempt) => attempt.userAnswers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attempt_id' })
  attempt: QuizAttempt;

  @ManyToOne('Question', (question: Question) => question.userAnswers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne('AnswerOption', (option: AnswerOption) => option.userAnswers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'selected_option_id' })
  selectedOption: AnswerOption;
}
