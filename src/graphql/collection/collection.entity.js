import {
  BaseEntity, Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export default class Collection extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'user_id',
  })
  userId

  @Column({
    type: 'enum',
    enum: ['shop', 'good'],
  })
  type;

  @Column({
    type: 'int',
  })
  typeId;
}
