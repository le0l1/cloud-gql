import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'character varying', length: 60, comment: '评论内容' })
  comment;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt;

  @Column({
    type: 'character varying',
    comment: 'comment type',
    name: 'comment_type',
  })
  commentType;

  @Column({
    type: 'int',
    name: 'comment_type_id',
  })
  commentTypeId;

  @Column({
    type: 'int',
    name: 'user_id',
  })
  userId;
}
