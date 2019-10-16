import {
  PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity, Entity,
} from 'typeorm';

@Entity()
export default class PhoneRecord extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
    name: 'phone',
    comment: '电话号码',
  })
  phone;

  @Column({
    type: 'int',
    name: 'shop_id',
    comment: '商户id',
  })
  shopId;

  @Column({
    type: 'int',
    name: 'user_id',
    comment: '用户id',
  })
  userId;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;
}
