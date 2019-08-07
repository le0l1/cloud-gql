import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm';

@Entity
export class GoldProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
  })
  name;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  cover;

  @Column({
    type: 'numeric',
  })
  salePrice;

  @Column({
    type: 'int',
  })
  stock;

  @Column({
    type: 'text',
  })
  description;
}
