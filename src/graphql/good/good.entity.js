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
import { decodeID, formateID } from "../../helper/id";
import { mergeIfValid } from "../../helper/util";

@Entity()
export class Good extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "character varying", nullable: true })
  name;

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
    type: "timestamp",
    nullable: true,
    name: "deleted_at"
  })
  deletedAt;

  @CreateDateColumn({ name: "created_at" })
  createdAt;

  static createGood({ goodBanners = [], shopId, ...rest }) {
    const bannerFactory = goodId => id =>
      Banner.update({
        id: decodeID(id),
      }, {
        goodId
      });

    return Good.create({
      shopId: decodeID(shopId),
      ...rest
    })
      .save()
      .then(({ id: goodId }) => {
        Banner.save(goodBanners.map(bannerFactory(goodId)));
        return {
          id: formateID("good", goodId),
          status: true
        };
      });
  }

  static updateGood({ id: goodId, shopId, goodBanners = [], ...rest }) {
    const bannerFactory = goodId => bannerId =>
      Banner.update({
        id: decodeID(bannerId),
      }, {
        goodId: decodeID(goodId)
      });
    return Good.update(
      {
        id: decodeID(goodId)
      },
      mergeIfValid(
        {
          shopId: decodeID(shopId),
          ...rest
        },
        {}
      )
    ).then(res => {
      Banner.save(goodBanners.map(bannerFactory(goodId)));
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
      .leftJoinAndMapMany(
        "good.goodBanners",
        Banner,
        "banner",
        "banner.good_id = good.id"
      )
      .where({
        id: decodeID(id)
      })
      .getOne()
      .then(res => {
        return {
          ...res,
          id
        };
      });
  }
}
