import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity
export default class Offer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    name: 'quote_id',
    type: 'int',
    comment: '询价单id',
  })
  quoteId;

  @Column({
    name: 'user_id',
    type: 'int',
    comment: '商户的用户id',
  })
  userId;

  @Column({
    name: 'offer_price',
    type: 'numeric',
    commnet: '报价价格',
  })
  offerPrice;

  @Column({
    name: 'is_acceptance',
    type: 'boolean',
    default: false,
    comment: '是否已中标',
  })
  isAcceptance;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;
}
