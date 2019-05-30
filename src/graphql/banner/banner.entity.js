import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  BaseEntity
} from "typeorm";
import { Shop } from "../shop/shop.entity";
import { Good } from "../good/good.entity";
import { isValid, mergeIfValid } from "../../helper/util";
import { decodeNumberId, formateID } from "../../helper/id";

@Entity()
export class Banner extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "character varying", nullable: true, comment: "轮播图标题" })
  title;

  @Column({
    type: "character varying",
    nullable: true,
    comment: "轮播图图片地址"
  })
  path;

  @Column({
    type: "character varying",
    nullable: true,
    comment: "轮播图文案内容"
  })
  content;

  @Column({
    type: "character varying",
    nullable: true,
    length: 10,
    comment: "轮播图标签"
  })
  tag;

  @Column({
    type: "character varying",
    nullable: true,
    comment: "轮播图跳转链接"
  })
  link;

  @CreateDateColumn()
  createdAt;

  @ManyToOne(type => Shop, shop => shop.shopBanners)
  shop;

  @Column({
    type: "int",
    nullable: true,
    comment: "轮播图所属商品id",
    name: "good_id"
  })
  goodId;

  @CreateDateColumn({ name: "created_at" })
  createdAt;

  @Column({
    type: "timestamp",
    name: "deleted_at",
    nullable: true
  })
  deletedAt;

  static createBanner({ goodId, ...rest }) {
    const currentBanner = Banner.create({ ...rest });
    if (isValid(goodId)) {
      currentBanner.goodId = decodeNumberId(goodId);
    }
    return currentBanner.save().then(({ id }) => ({
      id: formateID("banner", id),
      status: true
    }));
  }

  static deleteBanner(id) {
    return Banner.update(
      {
        id: decodeNumberId(id)
      },
      {
        deletedAt: new Date()
      }
    ).then(() => ({
      id,
      status: true
    }));
  }

  static searchBanner({ tag, goodId }) {
    const decodedGoodId = goodId ? decodeNumberId(goodId) : null;
    return Banner.find({
      where: mergeIfValid({ tag, goodId: decodedGoodId }, {})
    });
  }

  static updateBanner({ id, ...rest }) {
    return Banner.update(
      {
        id: decodeNumberId(id)
      },
      { ...rest }
    ).then(() => ({
      id,
      status: true
    }));
  }
}
