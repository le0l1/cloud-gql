import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class WithdrawBank extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  @Column({
    name: 'user_id',
    type: 'int',
    comment: '用户id',
  })
  userId

  @Column({
    name: 'cn_name',
    type: 'character varying',
    comment: '中文名',
  })
  cnname

  @Column({
    name: 'alipay_account',
    type: 'character varying',
    comment: '支付宝账号(手机号)',
  })
  alipayAccount

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt
}
