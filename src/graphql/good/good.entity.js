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

  @Column({ type: "text", nullable: true, name: "good_paramter" })
  goodParamter;

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
    name: "good_sale_price",
    nullable: true
  })
  goodSalePrice;

  @Column({
    type: "timestamp",
    nullable: true,
    name: "deleted_at"
  })
  deletedAt;

  @CreateDateColumn({ name: "created_at" })
  createdAt;

  static createGood({ shopId,  banners = [], ...rest }) {
    return Good.create({
      shopId: decodeID(shopId),
      cover: isValid(banners[0]) ? banners[0] : null,
      ...rest
    })
      .save()
      .then(({ id: goodId }) => {
        Banner.createBannerArr("good", goodId, banners);
        return {
          id: formateID("good", goodId),
          status: true
        };
      });
  }

  static updateGood({ id: goodId, shopId, banners,...rest }) {
    const realGoodId = decodeNumberId(goodId)
    return Good.update(
      {
        id: realGoodId
      },
      mergeIfValid(
        {
          shopId: decodeNumberId(shopId),
          cover: isValid(banners[0]) ? banners[0] : null,
          ...rest
        },
        {}
      )
    ).then(res => {
      Banner.createBannerArr('good', realGoodId, banners)
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

  static searchGoodConnection({ shopId, offset , limit = 10 }) {
    const goodQb = this.createQueryBuilder("good")
      .skip(Math.max(offset - 1, 0))
      .take(limit);

    return (isValid(shopId)
      ? goodQb.andWhere({
          shopId: decodeNumberId(shopId)
        })
      : goodQb
    ).getManyAndCount();
  }
}
