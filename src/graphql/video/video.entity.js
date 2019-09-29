import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export default class Video extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    name: 'user_id',
    type: 'int',
    comment: '用户id',
  })
  userId;

  @Column({
    name: 'video_url',
    type: 'character varying',
    comment: '视频地址',
  })
  videoUrl;

  @Column({
    name: 'title',
    type: 'character varying',
    comment: '视频标题',
  })
  title;

  @Column({
    type: 'int',
    nullable: true,
    insert: false,
    update: false,
    select: false,
    comment: '视频评论次数',
  })
  commentCount;

  @CreateDateColumn({
    name: 'created_at',
    comment: '创建时间',
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
