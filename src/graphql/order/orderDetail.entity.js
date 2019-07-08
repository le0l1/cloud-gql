import {
  BaseEntity, Entity, PrimaryColumn, Column,
} from 'typeorm';

@Entity()
export class OrderDetail extends BaseEntity {
  @PrimaryColumn({ name: 'order_id', type: 'int' })
  orderId;

  @Column({
    type: 'int',
    name: 'shop_id',
  })
  shopId;

  @Column({
    type: 'int',
    name: 'good_id',
  })
  goodId;

  @Column({
    type: 'character varying',
    name: 'good_name',
  })
  goodName;

  @Column({
    type: 'character varying',
    name: 'good_cover',
  })
  goodCover;

  @Column({
    type: 'character varying',
    name: 'good_sale_price',
  })
  goodSalePrice;

  @Column({
    type: 'int',
  })
  quantity;
}
