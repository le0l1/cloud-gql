import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Comment } from '../comment/comment.entity';
import { hashPassword } from '../../helper/encode';
import { formateID, decodeNumberId } from '../../helper/util';
import { UserCoupon } from '../coupon/userCoupon.entity';
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
    length: 64,
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
    comment: 'salt for password',
    type: 'character varying',
    nullable: true,
  })
  salt;

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

  @OneToMany(type => UserCoupon, userCoupon => userCoupon.user)
  userCoupon;

  @OneToMany(type => Transfer, transfer => transfer.payer)
  receipt

  @OneToMany(type => Transfer, transfer => transfer.payee)
  transfer

  static retrievePassword({ phone, password }) {
    return User.findOne({
      where: { phone },
    }).then((currentUser) => {
      if (!currentUser) throw new Error('用户不存在');

      const { hashed, salt } = hashPassword(password);
      currentUser.salt = salt;
      currentUser.password = hashed;
      return currentUser.save();
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
    const { hashed, salt } = hashPassword(password);
    return User.create({
      password: hashed,
      salt,
      ...rest,
    })
      .save()
      .then(res => ({
        id: formateID('user', res.id),
      }));
  }

  static getUser({ id }) {
    return User.findOne({
      where: {
        id: decodeNumberId(id),
      },
    });
  }

  static updateUserInfo({ id, ...rest }) {
    const realId = decodeNumberId(id);
    return User.update(
      {
        id: realId,
      },
      rest,
    ).then(() => ({
      id: realId,
      status: true,
    }));
  }

  static findByPhone(phone) {
    return User.findOneOrFail({
      where: {
        phone,
      },
    });
  }
}
