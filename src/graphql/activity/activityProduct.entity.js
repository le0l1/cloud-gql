import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm';

@Entity()
export class ActivityProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'activity_id',
  })
  activityId

  @Column({
    type: 'character varying',
    name: 'name',
  })
  name;

  @Column({
    type: 'int',
  })
  gold;

  @Column({
    type: 'character varying',
  })
  cover;

  @Column({
    type: 'int',
  })
  probability;

  @Column({
    type: 'timestamp',
    name: 'deleted_at',
    default: null,
  })
  deletedAt
}
