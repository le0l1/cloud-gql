import {
  BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../../helper/status';

const orderStatus = Object.values(OrderStatus);

@Entity()
export class OrderLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'order_id',
  })
  orderId;

  @Column({
    type: 'enum',
    name: 'old_status',
    enum: orderStatus,
  })
  oldStatus;

  @Column({
    type: 'enum',
    name: 'new_status',
    enum: orderStatus,
  })
  newStatus;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  description;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;
}
