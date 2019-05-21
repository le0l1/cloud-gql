import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  TreeParent,
  TreeChildren,
  Tree,
  getTreeRepository
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

  @ManyToMany(type => Shop)
  shops;

  static async getCategoryTree(id, route) {
    const parentCategory = new Category();
    if (isValid(id)) {
      parentCategory.id = decodeID(id);
    }
    if (isValid(route)) {
      parentCategory.route = route;
    }
    
    if (!parentCategory.id && !parentCategory.route) {
      return getTreeRepository(Category).findTrees();
    }
    
    return getTreeRepository(Category)
      .findDescendantsTree(parentCategory)
      .then(({ children }) => children);
  }
}
