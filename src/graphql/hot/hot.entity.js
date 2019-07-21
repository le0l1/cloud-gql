import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity()
export class Hot extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'enum',
    enum: ['HOME', 'SHOP'],
  })
  route;

  @Column({
    type: 'character varying',
  })
  content;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;
}
