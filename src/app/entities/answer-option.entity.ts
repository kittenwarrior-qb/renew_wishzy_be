import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import type { Question } from './question.entity';
import type { UserAnswer } from './user-answer.entity';

@Entity('answer_options')
export class AnswerOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'question_id' })
  questionId: string;

  @Column({ type: 'text', name: 'option_text' })
  optionText: string;

  @Column({ type: 'boolean', name: 'is_correct', default: false })
  isCorrect: boolean;

  @Column({ type: 'int', name: 'order_index' })
  orderIndex: number;

  @ManyToOne('Question', (question: Question) => question.answerOptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @OneToMany('UserAnswer', (answer: UserAnswer) => answer.selectedOption)
  userAnswers: UserAnswer[];
}
