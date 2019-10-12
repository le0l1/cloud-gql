import {
  Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity()
export default class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  @Column({
    name: 'user_id',
    type: 'int',
    comment: '用户id',
  })
  userId

  @Column({
    name: 'trigger_user_id',
    type: 'int',
    comment: '触发人id',
  })
  triggerUserId

  @Column({
    name: 'have_read',
    type: 'boolean',
    default: false,
    comment: '是否已读',
  })
  haveRead

  @Column({
    name: 'message_type',
    type: 'character varying',
    comment: '消息类型',
  })
  type

  @Column({
    name: 'message_type_id',
    type: 'int',
    comment: '消息类型的id',
  })
  typeId

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt
}
