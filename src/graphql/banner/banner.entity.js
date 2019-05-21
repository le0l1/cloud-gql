import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  BaseEntity
} from "typeorm";
import { Shop } from "../shop/shop.entity";

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
}
