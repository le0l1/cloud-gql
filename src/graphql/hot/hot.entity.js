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

  @Column({
    name: 'title',
    type: 'character varying',
    comment: '头条标题',
    default: '',
  })
  title;

  @Column({
    name: 'link',
    type: 'character varying',
    comment: '头条关联的链接',
    nullable: true,
  })
  link;


  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;
}
