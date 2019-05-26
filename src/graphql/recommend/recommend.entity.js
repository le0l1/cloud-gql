import { BaseEntity, Entity, Column, Index, PrimaryColumn } from "typeorm";
import { decodeID, formateID } from "../../helper/id";
import { Shop } from "../shop/shop.entity";

@Entity()
export class Recommend extends BaseEntity {
  @Index()
  @PrimaryColumn({ type: "character varying" })
  path;

  @Column({ type: "int", default: 1, comment: "1. shop 2. good" })
  type;

  @Column({
    type: "int",
    comment: "the id of recommend thing",
    name: "recommend_id"
  })
  recommendId;

  static createRecommend({ path, type, recommends }) {
    const recommendFactory = (type, path) => recommendId =>
      Recommend.create({
        recommendId: decodeID(recommendId),
        type,
        path
      });
    return Recommend.save(recommends.map(recommendFactory(type, path))).then(
      ({ id }) => {
        return {
          id: formateID("recommend", id),
          status: true
        };
      }
    );
  }

  static searchRecommend({ path, type }) {
    // if type is shop
    if (type === 1) {
      return Shop.createQueryBuilder("shop")
        .leftJoinAndSelect(
          Recommend,
          "recommend",
          "recommend.recommend_id = shop.id"
        )
        .where("recommend.path = :path")
        .setParameter("path", path)
        .getManyAndCount();
    }
  }
}
