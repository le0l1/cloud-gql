import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { decodeID, decodeTypeAndId } from '../../helper/util';
import { User } from '../user/user.entity';

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
    nullable: true,
  })
  commentType;

  @Column({
    type: 'int',
    name: 'comment_type_id',
    nullable: true,
  })
  commentTypeId;

  @ManyToOne(type => User, user => user.comments)
  belongto;

  static createComment({ typeId, belongto, ...rest }) {
    const [commentType, commentTypeId] = decodeTypeAndId(typeId);
    return Comment.create({
      commentType,
      commentTypeId,
      belongto: User.create({ id: decodeID(belongto) }),
      ...rest,
    }).save();
  }

  // 通过条件查找对应的评论
  static getCommentList({ typeId }) {
    const [commentType, commentTypeId] = decodeTypeAndId(typeId);

    return Comment.findAndCount({
      where: {
        commentType,
        commentTypeId,
      },
      relations: ['belongto'],
    });
  }
}
