import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn,
} from 'typeorm';
import { WithdrawMethod, WithdrawStatus } from '../../helper/status';

@Entity()
export class Withdraw extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'user_id',
  })
  userId;

  @Column({
    type: 'numeric',
  })
  totalCount;

  @Column({
    type: 'enum',
    name: 'method',
    enum: Object.values(WithdrawMethod),
  })
  method;

  @Column({
    type: 'enum',
    enum: Object.values(WithdrawStatus),
    default: WithdrawStatus.WAIT_REVIEW,
  })
  status;

  @Column({
    type: 'character varying',
    name: 'reject_desc',
    nullable: true,
  })
  rejectDesc;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt;
}
