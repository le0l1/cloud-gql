import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column,
  ManyToOne,
} from 'typeorm';
import { Shop } from '../shop/shop.entity';
import { BusinessCircle } from '../businessCircle/businessCircle.entity';

@Entity()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  path;

  @Column({
    type: 'character varying',
    name: 'image_type',
    nullable: true,
  })
  imageType;

  @Column({
    type: 'int',
    name: 'image_type_id',
    nullable: true,
  })
  imageTypeId;

  @ManyToOne(type => Shop)
  shop;

  @ManyToOne(type => BusinessCircle, businessCircle => businessCircle.images)
  businessCircle;
}
