import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 255, unique: true })
  idempotencyKey!: string;

  @Column({ length: 50 })
  gateway!: string;

  @Column('integer')
  amount!: number;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column({ length: 50 })
  status!: string;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  transactionId?: string;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
