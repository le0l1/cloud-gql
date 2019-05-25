import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { UserInputError } from "apollo-server-koa";
import { decodeID } from "../../helper/id";
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
    comment: "which shop has this comment",
    nullable: true
  })
  shopId;

  @ManyToOne(type => User, user => user.comments)
  belongto;

  static createComment({ shopId, belongto, ...rest }) {
    return Comment.create({
      shopId: decodeID(shopId),
      belongto: User.create({ id: decodeID(belongto) }),
      ...rest
    }).save();
  }

  // 通过条件查找对应的评论
  static getCommentList({ shopId }) {
    const findCommentWithWhere = condition =>
      Comment.findAndCount({
        where: condition,
        relations: ["belongto"]
      });

    // 查找商户评论
    if (shopId) {
      return findCommentWithWhere({
        shopId: decodeID(shopId)
      });
    }
  }
}
