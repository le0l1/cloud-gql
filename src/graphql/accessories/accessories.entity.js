import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm';

@Entity()
export class Accessories extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'rfq_id',
    nullable: true,
  })
  rfqId;

  @Column({
    type: 'character varying',
    name: 'accessories_name',
  })
  accessoriesName;

  @Column({
    type: 'int',
    name: 'accessories_quantity',
  })
  accessoriesQuantity;

  @Column({
    type: 'character varying',
    name: 'accessories_category',
  })
  accessoriesCategory;
}
