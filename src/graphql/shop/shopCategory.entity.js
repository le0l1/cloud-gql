import {
  BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ShopCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'shop_id',
    comment: '商户id',
  })
  shopId;

  @Column({
    type: 'int',
    name: 'category_id',
    commnet: '分类id',
  })
  categoryId;

  @Column({
    type: 'int',
    name: 'index',
    comment: '排名',
    default: 0,
  })
  index;

  @CreateDateColumn({
    name: 'created_at',
  })
  creatdAt;
}
