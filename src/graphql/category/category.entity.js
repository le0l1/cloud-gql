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

  @CreateDateColumn({ name: 'created_at' })
  createdAt;

  @Column({
    type: 'timestamp',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt;
}
