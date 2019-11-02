import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne,
} from 'typeorm';
import { Shop } from '../shop/shop.entity';

@Entity()
export class Phone extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  phone;


  @Column({
    type: 'int',
    default: 0,
  })
  count;

  @ManyToOne(type => Shop, shop => shop.phones)
  shop;
}
