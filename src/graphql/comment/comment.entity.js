import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne
} from "typeorm";
import { Shop } from "../shop/shop.entity";
import { UserInputError } from "apollo-server-koa";
import { decodeID } from "../../helper/id";

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "character varying", length: 60, comment: "评论内容" })
  comment;

  @UpdateDateColumn()
  updatedAt;

  @ManyToOne(type => Shop, shop => shop.shopComments)
  shop;

  @Column({ type: "character varying", comment: "评论的用户" })
  belongto;

  static createComment({ shopId, ...rest }) {
    const newComment = Comment.create(rest);
    if (shopId) {
      newComment.shop = Shop.create({
        id: decodeID(shopId)
      });
    }
    return newComment.save();
  }
}
