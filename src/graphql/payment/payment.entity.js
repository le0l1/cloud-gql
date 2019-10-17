import {
  BaseEntity, Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  // TODO: 微信支付和支付宝支付的支付订单号  可能会涉及退款等一系列操作 后期可能要拆开
  @Column({
    type: 'character varying',
    name: 'transaction_id',
    comment: '支付订单号',
    nullable: true,
  })
  transactionId;

  @Column({
    type: 'character varying',
    name: 'order_number',
    comment: '内部订单号',
  })
  orderNumber

  @Column({
    type: 'character varying',
    name: 'order_type',
    comment: '内部订单类型',
  })
  orderType

  @Column({
    type: 'int',
    name: 'payment_method',
    comment: '支付方式 1: alipay 2: wxpay',
  })
  paymentMethod;

  @Column({
    type: 'int',
    name: 'payment_status',
    default: 3,
  })
  paymentStatus;

  @Column({
    type: 'numeric',
    name: 'total_fee',
    comment: '总金额',
  })
  totalFee;
}
