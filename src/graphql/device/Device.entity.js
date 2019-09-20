import {
  BaseEntity, Entity, PrimaryColumn, Column,
} from 'typeorm';

@Entity()
export class Device extends BaseEntity {
  @PrimaryColumn({
    type: 'int',
    name: 'user_id',
  })
  userId;

  @Column({
    type: 'character varying',
    name: 'device_token',
  })
  deviceToken;
}
