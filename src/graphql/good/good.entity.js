import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Index
} from "typeorm";
import { Banner } from "../banner/banner.entity";
import { decodeID, formateID, decodeNumberId } from "../../helper/id";
import { mergeIfValid, isValid } from "../../helper/util";

@Entity()
export class Good extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "character varying", nullable: true })
  name;

  @Column({ type: "character varying", nullable: true })
  cover;

  @Column({ type: "character varying", nullable: true })
  subTitle;

  @Column({ type: "text", nullable: true })
  description;

  @Column({ type: "int", name: "shop_id", nullable: true })
  @Index()
  shopId;

  @Column({
    type: "int",
    name: "good_status",
    comment: "1. online 2. offline",
    default: 1
  })
  status;

  @Column({
    type: "int",
    name: "goods_sales",
    default: 100
  })
  goodsSales;

  @Column({
    type: "int",
    name: "goods_stocks",
    default: 0
  })
  goodsStocks;

  @Column({
    type: "numeric",
    nullable: true
  })
  goodsSalePrice;

  @Column({
    type: "timestamp",
    nullable: true,
    name: "deleted_at"
  })
  deletedAt;

  @CreateDateColumn({ name: "created_at" })
  createdAt;

  static createGood({ shopId, images, ...rest }) {
    return Good.create({
      shopId: decodeID(shopId),
      cover: isValid(images[0]) ? images[0] : null,
      ...rest
    })
      .save()
      .then(({ id: goodId }) => {
        Banner.createBannerArr("good", goodId, images);
        return {
          id: formateID("good", goodId),
          status: true
        };
      });
  }

  static updateGood({ id: goodId, shopId, ...rest }) {
    return Good.update(
      {
        id: decodeID(goodId)
      },
      mergeIfValid(
        {
          shopId: decodeID(shopId),
          cover: isValid(images[0]) ? images[0] : null,
          ...rest
        },
        {}
      )
    ).then(res => {
      return {
        id: goodId,
        status: true
      };
    });
  }

  static deleteGood({ id }) {
    return Good.update(decodeID(id), { deletedAt: new Date() }).then(
      ({ id: goodId }) => ({
        id: formateID("good", goodId),
        status: true
      })
    );
  }

  static searchGood({ id }) {
    return Good.createQueryBuilder("good")
      .where({
        id: decodeNumberId(id)
      })
      .getOne()
      .then(res => {
        return {
          ...res,
          id
        };
      });
  }

  static searchGoodConnection({ shopId, offset = 0, limit = 10 }) {
    return Good.createQueryBuilder("good")
      .where({
        shopId: decodeID(shopId)
      })
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }
}
