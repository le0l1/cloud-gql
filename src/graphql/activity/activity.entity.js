import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity()
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
  })
  name;

  @Column({
    type: 'timestamp',
    name: 'start_at',
  })
  startAt;

  @Column({
    type: 'timestamp',
    name: 'end_at',
    default: 'infinity',
  })
  endAt;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;
}
