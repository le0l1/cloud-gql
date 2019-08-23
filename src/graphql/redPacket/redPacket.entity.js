import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, VersionColumn,
} from 'typeorm';

@Entity()
export class RedPacket extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
  })
  sponsor;

  @Column({
    type: 'int',
  })
  quantity;

  @Column({
    type: 'int',
    name: 'total_fee',
  })
  totalFee;

  @Column({
    type: 'int',
    name: 'rest_quantity',
  })
  restQuantity

  @Column({
    type: 'character varying',
    name: 'order_number',
  })
  orderNumber

  @Column({
    type: 'int',
    name: 'payment_id',
  })
  paymentId


  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;

  @VersionColumn()
  version;
}
