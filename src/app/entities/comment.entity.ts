import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Lecture } from './lecture.entity';

export enum CommentStatus {
  PENDING = 'pending',
  REPLIED = 'replied',
  RESOLVED = 'resolved',
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'int', default: 0 })
  like!: number;

  @Column({ type: 'int', default: 0 })
  dislike!: number;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PENDING,
  })
  status!: CommentStatus;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'lecture_id' })
  lectureId!: string;

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Lecture)
  @JoinColumn({ name: 'lecture_id' })
  lecture!: Lecture;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Comment;
}
