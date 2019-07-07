import {
  BaseEntity, Entity, PrimaryColumn, Column,
} from 'typeorm';

@Entity()
export class OrderDetail extends BaseEntity {
  @PrimaryColumn({ name: 'order_id', type: 'int' })
  orderId;

  @Column({
    type: 'int',
    name: 'good_id',
  })
  goodId;

  @Column({
    type: 'int',
  })
  quantity;
}
