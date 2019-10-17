import {
  BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';

@Entity()
export default class PaymentOrder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  @Column({
    type: 'int',
    name: 'payment_id',
    comment: '支付流水id',
  })
  paymentId


  @Column({
    type: 'int',
    name: 'order_type_id',
    comment: '关联的订单类型id',
  })
  orderTypeId

  @Column({
    type: 'character varying',
    name: 'order_type',
    comment: '订单类型',
  })
  orderType

  @Column({
    type: 'character varying',
    name: 'order_number',
    comment: '订单号',
  })
  orderNumber

  @CreateDateColumn({
    name: 'created_at',
  })
  creadtAt
}
