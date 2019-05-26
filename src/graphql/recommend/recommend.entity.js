import { BaseEntity, Entity, Column, Index, PrimaryColumn } from "typeorm";
import { decodeID, formateID } from "../../helper/id";

@Entity()
export class Recommend extends BaseEntity {
  @Index()
  @PrimaryColumn({ type: "character varying" })
  path;

  @Column({ type: "int", default: 1, comment: "1. shop 2. good" })
  type;

  @Column({ type: "int", comment: "the id of recommend thing" })
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
}
