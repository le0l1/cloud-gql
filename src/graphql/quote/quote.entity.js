import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity()
export default class Quote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    name: 'user_id',
    type: 'int',
    comment: '用户id',
  })
  userId;

  @Column({
    name: 'vehicle_model',
    type: 'character varying',
    comment: '车型',
  })
  vehicleModel;

  @Column({
    name: 'vehicle_series',
    type: 'character varying',
    comment: '车系',
  })
  vehicleSeries;

  @Column({
    name: 'description',
    type: 'character varying',
    comment: '描述',
  })
  description;

  @Column({
    name: 'offer_id',
    type: 'int',
    comment: '中标报价id',
    default: null,
  })
  offerId;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;

  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    default: null,
    comment: '删除时间',
  })
  deletedAt;
}
