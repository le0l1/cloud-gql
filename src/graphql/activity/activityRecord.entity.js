import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm';

@Entity()
export class ActivityRecord extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'int',
    name: 'user_id',
  })
  userId;

  @Column({
    type: 'int',
    name: 'activity_product_id',
  })
  activityProductId;
}
