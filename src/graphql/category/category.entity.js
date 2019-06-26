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
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Shop } from '../shop/shop.entity';
import {
  getQB, where, getMany, getOne,
} from '../../helper/sql';
import {
  isValid,
  flatEntitiesTree,
  pipe,
  decodeID,
  formateID,
  decodeNumberId,
} from '../../helper/util';
import { Good } from '../good/good.entity';

@Entity()
@Tree('closure-table')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
    length: 20,
    comment: '分类目录',
    nullable: true,
  })
  name;

  @Column({ type: 'integer', comment: '分类状态', nullable: true })
  status;

  @Column({
    type: 'character varying',
    length: 20,
    comment: '分类标签',
    nullable: true,
  })
  tag;

  @Column({ type: 'character varying', nullable: true, comment: '分类图片' })
  image;

  @Column({ type: 'character varying', length: 10, nullable: true })
  route;

  @TreeParent()
  parent;

  @TreeChildren()
  children;

  @ManyToMany(type => Shop, shop => shop.categories)
  shops;

  @ManyToMany(type => Good, good => good.categories)
  good;

  @CreateDateColumn({ name: 'created_at' })
  createdAt;

  @Column({
    type: 'timestamp',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt;

  static searchCategorys({ route, id, root }) {
    if (isValid(id)) {
      return this.searchCategorysDescends(id);
    }

    if (isValid(route)) {
      return this.searchCategorysByRoute(route);
    }

    if (isValid(root)) {
      return this.searchCategorysRoot(root);
    }
  }

  static searchCategorysByRoute(route) {
    return Category.find({
      where: {
        route,
        parent: null,
        deletedAt: null,
      },
    });
  }

  static searchCategorysRoot(root) {
    return Category.createQueryBuilder('category')
      .innerJoin(
        getTreeRepository(Category).metadata.closureJunctionTable.tableName,
        'categoryClosure',
        'categoryClosure.id_descendant = category.id',
      )
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('id')
          .from(Category)
          .where('route = :root')
          .getQuery();
        return `categoryClosure.id_ancestor IN${subQuery}`;
      })
      .andWhere('category.deletedAt is null')
      .setParameter('root', root)
      .getRawAndEntities()
      .then((res) => {
        const relationMap = res.raw.map(({ category_id: id, category_parentId: parent }) => ({
          id,
          parent,
        }));
        return flatEntitiesTree(res.entities, relationMap, 'children');
      });
  }

  static searchCategorysDescends(id) {
    const parentCategory = Category.create({
      id: decodeNumberId(id),
    });
    return getTreeRepository(Category)
      .createDescendantsQueryBuilder('category', 'categoryClosure', parentCategory)
      .andWhere('category.deletedAt is null')
      .getMany()
      .then(res =>
        // filter parent node
        res.filter(node => node.id !== decodeNumberId(id)));
  }

  static createCategory({ parentId = null, ...rest }) {
    return Category.create({
      ...rest,
      parent: isValid(parentId)
        ? Category.create({
          id: decodeNumberId(parentId),
        })
        : null,
    })
      .save()
      .then(({ id }) => ({
        id,
        status: true,
      }));
  }

  static deleteCategory({ id }) {
    return Category.update(
      {
        id: decodeNumberId(id),
      },
      {
        deletedAt: new Date(),
      },
    ).then(() => ({
      id,
      status: true,
    }));
  }

  static updateCategory({ id, ...rest }) {
    return Category.update(
      {
        id: decodeNumberId(id),
      },
      rest,
    );
  }
}
