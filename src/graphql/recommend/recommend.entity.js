import {
  BaseEntity,
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";
import { decodeID, formateID } from "../../helper/id";
import { Shop } from "../shop/shop.entity";

@Entity()
export class Recommend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Index()
  @Column({ type: "character varying", comment: "the path of recommend" })
  path;

  @Column({ type: "int", default: 1, comment: "1. shop 2. good" })
  type;

  @Column({
    type: "int",
    comment: "the id of recommend thing",
    name: "node"
  })
  recommendNodeId;

  @Column({
    type: "timestamp",
    comment: "when the record has been deleted",
    name: "delete_at",
    nullable: true
  })
  deletedAt;

  static createRecommend({ path, type, recommendNodeId }) {
    return Recommend.save({
      path,
      type,
      recommendNodeId: decodeID(recommendNodeId)
    }).then(({ id }) => {
      return {
        id: formateID("recommend", id),
        status: true
      };
    });
  }

  static searchRecommend({ path, type }) {
    return Recommend.createQueryBuilder("recommend")
      .leftJoinAndMapOne(
        "recommend.recommendNode",
        Shop,
        "shop",
        "shop.id = recommend.node"
      )
      .where("recommend.path = :path and recommend.delete_at is null")
      .setParameter("path", path)
      .getManyAndCount();
  }
  static updateRecommend({ id, path, type, recommendNodeId }) {
    return Recommend.update(decodeID(id), {
      path,
      type,
      recommendNodeId: decodeID(recommendNodeId)
    }).then(() => ({
      id,
      status: true
    }));
  }

  static deleteRecommend({ id }) {
    return Recommend.update(decodeID(id), { deletedAt: new Date() }).then(
      () => ({
        id,
        status: true
      })
    );
  }
}
