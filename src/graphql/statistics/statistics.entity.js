import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm';

@Entity()
export class Statistics extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'user_count',
  })
  userCount;

  @Column({
    type: 'int',
    name: 'order_count',
  })
  orderCount;

  @Column({
    type: 'int',
    name: 'phone_count',
  })
  phoneCount;

  @Column({
    type: 'int',
    name: 'money_count',
  })
  moneyCount;

  @Column({
    type: 'int',
    name: 'shop_id',
    nullable: true,
  })
  shopId;

  @Column({
    type: 'timestamp',
  })
  collectAt;
}
