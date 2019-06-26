import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Good } from '../good/good.entity';
import { User } from '../user/user.entity';

@Entity()
export default class Cart extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @ManyToOne(type => Good)
  good;

  @Column({
    type: 'int',
  })
  quantity;

  @ManyToOne(type => User)
  user;
}
