import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Entity,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['offerId'])
export default class OfferRecord extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    name: 'offer_order_number',
    type: 'character varying',
    comment: '报价订单号',
  })
  orderNumber;

  @Column({
    name: 'offer_id',
    type: 'int',
    comment: '报价id',
  })
  offerId;

  @Column({
    name: 'payment_id',
    type: 'int',
    comment: '支付记录id',
  })
  paymentId;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;
}
