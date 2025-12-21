import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Feedback } from './feedback.entity';

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity('feedback_reactions')
@Unique(['feedbackId', 'userId']) // Mỗi user chỉ có 1 reaction per feedback
export class FeedbackReaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'feedback_id' })
  feedbackId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: ReactionType })
  type!: ReactionType;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Feedback, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feedback_id' })
  feedback!: Feedback;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
