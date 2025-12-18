import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID của setting' })
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty({ description: 'Key của setting', example: 'instructor_revenue_percentage' })
  key!: string;

  @Column({ type: 'varchar', length: 500 })
  @ApiProperty({ description: 'Giá trị của setting', example: '70' })
  value!: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Mô tả setting', required: false })
  description?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}

// Enum for known setting keys
export enum SystemSettingKey {
  INSTRUCTOR_REVENUE_PERCENTAGE = 'instructor_revenue_percentage',
}
