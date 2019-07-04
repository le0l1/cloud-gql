import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity()
export class News extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
  })
  cover;

  @Column({
    type: 'character varying',
  })
  title;

  @Column({
    type: 'text',
  })
  content;

  @CreateDateColumn({ name: 'created_at' })
  createdAt;
}
