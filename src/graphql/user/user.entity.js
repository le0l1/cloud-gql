import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  VersionColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Comment } from '../comment/comment.entity';
import { Transfer } from '../transfer/transfer.entity';
import { Shop } from '../shop/shop.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ comment: 'user name', type: 'character varying', nullable: true })
  name;

  @Column({ comment: 'user age', type: 'smallint', nullable: true })
  age;

  @Column({
    comment: 'user address',
    type: 'character varying',
    nullable: true,
  })
  address;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  profilePicture;

  @Column({
    comment: 'user password',
    type: 'character',
    length: 65,
    nullable: true,
  })
  password;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;

  @Column({
    comment: 'user phone number',
    type: 'character varying',
    nullable: true,
  })
  phone;

  @Column({
    comment: 'user role 1. customer 2. merchant 3. root',
    type: 'smallint',
    default: 1,
  })
  role;

  @Column({
    comment: 'user`s garage',
    type: 'character varying',
    nullable: true,
  })
  garage;

  @Column({
    type: 'bigint',
    default: 0,
    name: 'total_fee',
  })
  totalFee;

  @Column({ comment: 'user`s area', type: 'character varying', nullable: true })
  area;

  @Column({ comment: 'user`s city', type: 'character varying', nullable: true })
  city;

  @Column({
    type: 'numeric',
    default: 0,
  })
  gold;

  @OneToMany(type => Comment, comment => comment.belongto)
  comments;

  @OneToMany(type => Transfer, transfer => transfer.payee)
  transfer;

  @OneToOne(type => Shop, shop => shop.belongto)
  shop;

  @VersionColumn({
    nullable: true,
  })
  version;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt;

  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    default: null,
  })
  deletedAt;
}
