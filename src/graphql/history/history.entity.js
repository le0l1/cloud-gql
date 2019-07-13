import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity()
export class History extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'user_id',
  })
  userId;

  @Column({
    type: 'enum',
    enum: ['shop', 'good'],
    default: 'shop',
  })
  type;

  @Column({
    type: 'int',
    name: 'type_id',
  })
  typeId;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;
}
