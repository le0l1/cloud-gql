import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  JoinTable,
  ManyToMany,
  OneToMany
} from "typeorm";
import { isValid } from "../../helper/util";
import { Category } from "../category/category.entity";
import { decodeID, formateID } from "../../helper/id";
import { Banner } from "../banner/banner.entity";
import { Comment } from "../comment/comment.entity";

@Entity()
export class Shop extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "character varying", comment: "商户名称", nullable: true })
  name;

  @Column({ type: "character varying", comment: "商户qq", nullable: true })
  qqchat;

  @Column({ type: "character varying", comment: "商户微信", nullable: true })
  wechat;

  @Column({ type: "character varying", comment: "商户手机号", nullable: true })
  phone;

  @Column({ type: "text", comment: "商户描述", nullable: true })
  description;

  @Column({ type: "integer", comment: "商户从属" })
  belongto;

  @Column({
    type: "integer",
    comment: "商户状态 1: 正常, 2: 暂停营业",
    default: 1
  })
  status;

  @CreateDateColumn()
  createdAt;

  @Column({ type: "boolean", default: false, comment: "商户审核状态" })
  is_passed;

  @Column({
    type: "character varying",
    comment: "商户所在地区",
    nullable: true
  })
  area;

  @Column({
    type: "character varying",
    comment: "商户所在城市",
    nullable: true
  })
  city;

  @Column({
    type: "timestamp",
    nullable: true
  })
  deletedAt;

  @Column({
    type: "character varying",
    comment: "商户详细地址",
    nullable: true
  })
  address;

  @ManyToMany(type => Category, category => category.shops)
  @JoinTable()
  coreBusiness;

  @OneToMany(type => Banner, banner => banner.shop)
  shopBanners;

  @OneToMany(type => Comment, comment => comment.shop)
  shopComments;
}
