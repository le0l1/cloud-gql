import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from "typeorm";
import { Banner } from "../banner/banner.entity";
import { decodeID, formateID } from "../../helper/id";

@Entity()
export class Good extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "character varying", nullable: true })
  name;

  @Column({ type: "numeric", default: 9999 })
  price;

  @Column({ type: "character varying", nullable: true })
  subTitle;

  @Column({ type: "text", nullable: true })
  description;

  @Column({ type: "int", name: "shop_id" })
  shopId;

  @Column({
    type: "int",
    name: "good_status",
    comment: "1. online 2. offline",
    default: 1
  })
  status;

  static createGood({
    shopBanners = [],
    name,
    subTitle,
    price,
    description,
    shopId
  }) {
    const bannerFactory = goodId => id =>
      Banner.create({
        id: decodeID(id),
        goodId
      });
    return Good.create({
      name,
      subTitle,
      price,
      description,
      shopId
    })
      .save()
      .then(({ id: goodId }) => {
        Banner.save(shopBanners.map(bannerFactory(goodId)));
        return {
          id: formateID("good", goodId),
          status: true
        };
      });
  }
}
