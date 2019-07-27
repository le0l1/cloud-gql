import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity()
export class CheckIn extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'user_id',
  })
  userId;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;
}
