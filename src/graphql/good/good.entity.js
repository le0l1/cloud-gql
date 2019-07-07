import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  RelationId,
  ManyToOne,
} from 'typeorm';
import { Category } from '../category/category.entity';
import { Shop } from '../shop/shop.entity';

@Entity()
export class Good extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'character varying', nullable: true })
  name;

  @Column({ type: 'character varying', nullable: true })
  cover;

  @Column({ type: 'character varying', nullable: true })
  subTitle;

  @Column({ type: 'text', nullable: true })
  description;

  @Column({ type: 'text', nullable: true, name: 'good_paramter' })
  goodParamter;


  @Column({
    type: 'int',
    name: 'good_status',
    comment: '1. online 2. offline',
    default: 1,
  })
  status;

  @Column({
    type: 'int',
    name: 'goods_sales',
    default: 100,
  })
  goodsSales;

  @Column({
    type: 'character varying',
    nullable: true,
    name: 'shipping_address',
    comment: '配送地址',
  })
  shippingAddress;

  @Column({
    type: 'character varying',
    nullable: true,
    comment: '条款',
  })
  terms;

  @Column({
    type: 'character varying',
    nullable: true,
    comment: '运费',
  })
  freight;

  @Column({
    type: 'int',
    name: 'goods_stocks',
    default: 0,
  })
  goodsStocks;

  @Column({
    type: 'numeric',
    name: 'good_sale_price',
  })
  goodSalePrice;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt;

  @CreateDateColumn({ name: 'created_at' })
  createdAt;

  @ManyToMany(type => Category)
  @JoinTable()
  categories;


  @RelationId(good => good.shop)
  shopId;

  @ManyToOne(type => Shop)
  shop;
}
