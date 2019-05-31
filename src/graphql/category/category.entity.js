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
  JoinTable,
  Repository,
  CreateDateColumn
} from "typeorm";
import { Shop } from "../shop/shop.entity";
import { pipe, getQB, where, getMany, getOne } from "../../helper/database/sql";
import { isValid } from "../../helper/util";
import { decodeID, formateID, decodeNumberId } from "../../helper/id";

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

  @CreateDateColumn({ name: "created_at" })
  createdAt;

  @Column({
    type: "timestamp",
    name: "deleted_at",
    nullable: true
  })
  deletedAt;

  static searchCategorys({ route, id }) {
    if (isValid(id)) {
      const parentCategory = Category.create({
        id: decodeNumberId(id)
      });
      return getTreeRepository(Category)
        .createDescendantsQueryBuilder(
          "category",
          "categoryClosure",
          parentCategory
        )
        .andWhere("category.deletedAt is null")
        .getMany()
        .then(res => {
          // filter parent node
          return res.filter(node => node.id !== decodeNumberId(id));
        });
    }

    if (isValid(route)) {
      return Category.find({
        where: {
          route,
          parent: null,
          deletedAt: null
        }
      });
    }

    return getTreeRepository(Category).findTrees();
  }

  static createCategory({ parentId = null, ...rest }) {
    return Category.create({
      ...rest,
      parent: isValid(parentId)
        ? Category.create({
            id: decodeNumberId(parentId)
          })
        : null
    })
      .save()
      .then(({ id }) => ({
        id: formateID("category", id),
        status: true
      }));
  }

  static deleteCategory({ id }) {
    return Category.update(
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
}
