import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  TreeParent,
  TreeChildren,
  Tree,
  getTreeRepository,
  JoinTable
} from "typeorm";
import { Shop } from "../shop/shop.entity";
import { pipe, getQB, where, getMany, getOne } from "../../helper/database/sql";
import { isValid } from "../../helper/util";

@Entity()
@Tree("closure-table")
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "character varying",
    length: 20,
    comment: "分类目录",
    nullable: true
  })
  name;

  @Column({ type: "integer", comment: "分类状态", nullable: true })
  status;

  @Column({
    type: "character varying",
    length: 20,
    comment: "分类标签",
    nullable: true
  })
  tag;

  @Column({ type: "character varying", nullable: true, comment: "分类图片" })
  image;

  @Column({ type: "character varying", length: 10, nullable: true })
  route;

  @TreeParent()
  parent;

  @TreeChildren()
  children;

  @ManyToMany(type => Shop, shop => shop.coreBusiness)
  shops;

}