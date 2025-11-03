import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Voucher } from './vouchers.entity';

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  MOMO = 'momo',
  VNPay = 'vnpay',
  ZaloPay = 'zalopay',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'voucher_id' })
  voucherId: string;

  @Column({ type: 'uuid', nullable: false, name: 'user_id' })
  userId: string;

  @Column({ type: 'decimal', name: 'total_price', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'varchar', length: 50 })
  status!: OrderStatus;

  @Column({ type: 'varchar', name: 'payment_method', length: 100 })
  paymentMethod!: PaymentMethod;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Voucher, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'voucher_id' })
  voucher?: Voucher;
}
