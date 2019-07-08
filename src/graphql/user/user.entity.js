import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  VersionColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../comment/comment.entity';
import { hashPassword } from '../../helper/encode';
import { decodeNumberId } from '../../helper/util';
import { Transfer } from '../transfer/transfer.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ comment: 'user name', type: 'character varying', nullable: true })
  name;

  @Column({ comment: 'user age', type: 'smallint', nullable: true })
  age;

  @Column({
    comment: 'user address',
    type: 'character varying',
    nullable: true,
  })
  address;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  profilePicture;

  @Column({
    comment: 'user password',
    type: 'character',
    length: 65,
    nullable: true,
  })
  password;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt;

  @Column({
    comment: 'user phone number',
    type: 'character varying',
    nullable: true,
  })
  phone;

  @Column({
    comment: 'user role 1. customer 2. merchant 3. root',
    type: 'smallint',
    default: 1,
  })
  role;

  @Column({
    comment: 'user`s garage',
    type: 'character varying',
    nullable: true,
  })
  garage;

  @Column({
    type: 'bigint',
    default: 0,
    name: 'total_fee',
  })
  totalFee;

  @Column({ comment: 'user`s area', type: 'character varying', nullable: true })
  area;

  @Column({ comment: 'user`s city', type: 'character varying', nullable: true })
  city;

  @OneToMany(type => Comment, comment => comment.belongto)
  comments;

  @OneToMany(type => Transfer, transfer => transfer.payee)
  transfer;

  @VersionColumn({
    nullable: true,
  })
  version;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt;

  static retrievePassword({ phone, password }) {
    return User.findOne({
      where: { phone },
    }).then((currentUser) => {
      if (!currentUser) throw new Error('用户不存在');

      const pwd = hashPassword(password);
      return User.merge(currentUser, { password: pwd }).save();
    });
  }

  static checkIfExists(phone) {
    return User.findOne({
      where: {
        phone,
      },
    }).then(res => !!res);
  }

  static createUser({ password, ...rest }) {
    const pwd = hashPassword(password);
    return User.create({
      password: pwd,
      ...rest,
    }).save();
  }

  static getUser({ id }) {
    return User.findOne({
      where: {
        id: decodeNumberId(id),
      },
    });
  }


  static findByPhone(phone) {
    return User.findOneOrFail({
      where: {
        phone,
      },
    });
  }
}
