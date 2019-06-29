import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Payment } from '../payment/payment.entity';
import { Shop } from '../shop/shop.entity';

@Entity()
export class Transfer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
    comment: '交易号',
    name: 'record_number',
  })
  recordNumber;

  @ManyToOne(type => User)
  payer;

  @ManyToOne(type => Shop)
  payee;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  remark;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt;

  @OneToOne(type => Payment)
  @JoinColumn()
  payment;
}
