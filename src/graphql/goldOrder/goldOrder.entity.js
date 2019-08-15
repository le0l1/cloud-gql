import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';
import { GoldProductRecordStatus } from '../../helper/status';

@Entity()
export class GoldOrder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'user_id',
  })
  userId;

  @Column({
    type: 'int',
    name: 'gold_product_id',
  })
  goldProductId;

  @Column({
    type: 'int',
    name: 'address_id',
  })
  addressId;

  @Column({
    type: 'enum',
    enum: Object.values(GoldProductRecordStatus),
    default: GoldProductRecordStatus.WAIT_SHIP,
  })
  status;

  @CreateDateColumn({
    name: 'createdAt',
  })
  createdAt;

  @Column({
    type: 'timestamp',
    name: 'deleted_at',
    default: null,
  })
  deletedAt;
}
