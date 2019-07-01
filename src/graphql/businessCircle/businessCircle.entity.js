import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Entity, ManyToOne, OneToMany,
} from 'typeorm';
import { Image } from '../image/image.entity';
import { User } from '../user/user.entity';

@Entity()
export class BusinessCircle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  @Column({
    type: 'int',
    nullable: true,
    name: 'user_id',
  })
  userId

  @Column({
    type: 'character varying',
    nullable: true,
  })
  content

  @Column({
    type: 'int',
    default: 0,
    name: 'star_count',
  })
  starCount

  @Column({
    type: 'int',
    default: 0,
    name: 'comment_count',
  })
  commentCount

  @Column({
    type: 'int',
    default: 1,
    name: 'report_status',
    comment: '1: isNotReported, 2: isReported',
  })
  reportStatus

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt

  @ManyToOne(type => User)
  user;

  @OneToMany(type => Image, image => image.businessCircle)
  images;
}
