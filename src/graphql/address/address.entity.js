import {
  BaseEntity,
  Entity,
  ManyToOne,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export default class Address extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
  })
  name;

  @Column({
    type: 'character varying',
  })
  phone;

  @Column({
    type: 'character varying',
  })
  province;

  @Column({
    type: 'character varying',
  })
  city;

  @Column({
    type: 'character varying',
  })
  district;

  @Column({
    type: 'character varying',
  })
  address;

  @Column({
    name: 'is_default',
    type: 'boolean',
  })
  isDefault;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt;

  @ManyToOne(type => User)
  user;
}
