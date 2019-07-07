import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'user_id',
  })
  userId;

  @Column({
    type: 'character varying',
    name: 'order_number',
  })
  orderNumber;

  @Column({
    type: 'numeric',
    name: 'discount',
  })
  discount;

  @Column({
    type: 'numeric',
    name: 'total_count',
  })
  totalCount;

  @Column({
    type: 'int',
    name: 'address_id',
  })
  addressId;

  @Column({
    type: 'int',
    name: 'payment_id',
  })
  paymentId;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;
}
