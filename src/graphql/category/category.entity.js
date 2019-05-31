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
      return getTreeRepository(Category)
        .findDescendantsTree(
          Category.create({
            id: decodeNumberId(id)
          })
        )
        .then(({ children }) => children);
    }

    if (isValid(route)) {
      return Category.find({
        route
      });
    }

    return getTreeRepository(Category).findTrees();
  }

  static createCategory({ parentId = null, ...rest }) {
    const currentCategory = Category.create({
      ...rest
    });

    if (isValid(parentId)) {
      currentCategory.parent = Category.create({
        id: decodeNumberId(parentId)
      });
    }

    return currentCategory.save().then(({ id }) => ({
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
