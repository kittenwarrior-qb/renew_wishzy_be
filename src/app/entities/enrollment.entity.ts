import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';

export enum EnrollmentStatus {
  NOT_STARTED = 'not_started',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
}

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'detail_order_id', nullable: true })
  detailOrderId?: string;

  @Column({ type: 'uuid', name: 'course_id' })
  courseId!: string;

  @Column({ type: 'timestamp', name: 'enrollment_date', default: () => 'CURRENT_TIMESTAMP' })
  enrollmentDate!: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: EnrollmentStatus.NOT_STARTED,
  })
  status!: EnrollmentStatus;

  @Column({ type: 'integer', default: 0 })
  progress!: number;

  @Column({ type: 'timestamp', name: 'last_access', default: () => 'CURRENT_TIMESTAMP' })
  lastAccess!: Date;

  @Column({ type: 'varchar', name: 'certificate_url', length: 255, nullable: true })
  certificateUrl?: string;

  @Column({ type: 'jsonb', name: 'attributes', nullable: true })
  attributes?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Course, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'course_id' })
  course?: Course;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
