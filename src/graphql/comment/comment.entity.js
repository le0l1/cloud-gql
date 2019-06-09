import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import {
  UserInputError,
  addSchemaLevelResolveFunction
} from "apollo-server-koa";
import { decodeID, decodeIDAndType } from "../../helper/id";
import { User } from "../user/user.entity";

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "character varying", length: 60, comment: "评论内容" })
  comment;

  @UpdateDateColumn()
  updatedAt;

  @Column({
    type: "character varying",
    comment: "comment type",
    nullable: true
  })
  commentType;

  @Column({
    type: "character varying",
    nullable: true
  })
  commentTypeId;

  @ManyToOne(type => User, user => user.comments)
  belongto;

  static createComment({ typeId, belongto, ...rest }) {
    const [commentType, commentTypeId] = decodeIDAndType(typeId);
    return Comment.create({
      commentType,
      commentTypeId,
      belongto: User.create({ id: decodeID(belongto) }),
      ...rest
    }).save();
  }

  // 通过条件查找对应的评论
  static getCommentList({ typeId }) {
    const [commentType, commentTypeId] = decodeIDAndType(typeId);

    return Comment.findAndCount({
      where: {
        commentType,
        commentTypeId
      },
      relations: ["belongto"]
    });
  }
}
