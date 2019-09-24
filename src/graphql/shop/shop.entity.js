import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  JoinTable,
  ManyToMany,
  OneToMany,
  Index,
  OneToOne, JoinColumn, RelationId,
} from 'typeorm';
import { Category } from '../category/category.entity';
import { Banner } from '../banner/banner.entity';
import { Phone } from '../phone/phone.entity';
import { Image } from '../image/image.entity';
import { User } from '../user/user.entity';
import { ShopType } from '../../helper/status';


@Entity()
export class Shop extends BaseEntity {
  @Index()
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'character varying', comment: '商户名称', nullable: true })
  name;

  @Column({ type: 'character varying', comment: '商户qq', nullable: true })
  qqchat;

  @Column({ type: 'character varying', comment: '商户微信', nullable: true })
  wechat;

  @Column({ type: 'text', comment: '商户描述', nullable: true })
  description;

  @Column({
    type: 'integer',
    comment: '商户状态 1: 正常, 2: 暂停营业',
    default: 1,
  })
  status;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  cover;

  @CreateDateColumn()
  createdAt;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_passed',
    comment: '商户审核状态',
  })
  isPassed;

  @Column({
    type: 'enum',
    enum: Object.values(ShopType),
    default: ShopType.NORMAL,
    comment: '商户类型',
  })
  type;


  @Column({
    type: 'character varying',
    comment: '商户所在地区',
    nullable: true,
  })
  area;

  @Column({
    type: 'character varying',
    comment: '商户所在城市',
    nullable: true,
  })
  city;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deletedAt;

  @Column({
    type: 'character varying',
    comment: '商户详细地址',
    nullable: true,
  })
  address;

  @Column({
    type: 'character varying',
    comment: '商户联系方式 冗余字段',
    nullable: true,
  })
  phone;

  @ManyToMany(type => Category)
  @JoinTable()
  categories;

  @OneToMany(type => Banner, banner => banner.shop)
  banners;

  @OneToMany(type => Image, image => image.shop)
  images;

  @OneToMany(type => Phone, phone => phone.shop)
  phones;

  @OneToOne(type => User)
  @JoinColumn()
  user;

  @RelationId(shop => shop.user)
  belongto;
}
