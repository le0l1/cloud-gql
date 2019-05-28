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
  Repository
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

  static searchCategorys({ route, id }) {
    if (isValid(id)) {
      console.log(id);
      return getTreeRepository(Category)
        .findDescendantsTree(
          Category.create({
            id: decodeNumberId(id)
          })
        )
        .then(({ children }) => {
          console.log(children)
          return children
        });
    }
    if (isValid(route)) {
      return Category.find({
        route
      });
    }
    if (!parentCategory.id && !parentCategory.route) {
      return getTreeRepository(Category).findTrees();
    }
  }

  static createCategory({ parentId = null, ...rest }) {
    const currentCategory = Category.create({
      ...rest
    });

    if (isValid(parentId)) {
      currentCategory.parent = Category.create({
        id: decodeNumberId(parentId)
      })
    }

    return currentCategory.save().then(({ id }) => ({
      id: formateID("category", id),
      status: true
    }));
  }
}
