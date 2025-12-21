import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import type { Question } from './question.entity';
import type { QuizAttempt } from './quiz-attempt.entity';
import type { Lecture } from './lecture.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'creator_id' })
  creatorId: string;

  @Column({ type: 'uuid', name: 'entity_id', nullable: true })
  entityId?: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true, name: 'is_public' })
  isPublic: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_free' })
  isFree: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'int', nullable: true, name: 'time_limit' })
  timeLimit: number;

  @Column({ type: 'int', default: 0, name: 'total_attempts' })
  totalAttempts: number;

  @Column({ type: 'int', default: 0, name: 'share_count' })
  shareCount: number;

  @Column({ type: 'int', default: 100, name: 'passing_score', comment: 'Minimum percentage score required to pass the quiz' })
  passingScore: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToOne('Lecture', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'entity_id' })
  lecture?: Lecture;

  @OneToMany('Question', (question: Question) => question.quiz, { cascade: true })
  questions: Question[];

  @OneToMany('QuizAttempt', (attempt: QuizAttempt) => attempt.quiz)
  attempts: QuizAttempt[];
}
