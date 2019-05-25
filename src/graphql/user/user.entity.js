import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Comment } from "../comment/comment.entity";
import { hashPassword } from "../../helper/auth/encode";
import { formateID } from "../../helper/id";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({ comment: "user name", type: "character varying", nullable: true })
  name;

  @Column({ comment: "user age", type: "smallint", nullable: true })
  age;

  @Column({
    comment: "user address",
    type: "character varying",
    nullable: true
  })
  address;

  @Column({
    comment: "user password",
    type: "character",
    length: 64,
    nullable: true
  })
  password;

  @CreateDateColumn()
  created_at;

  @Column({
    comment: "user phone number",
    type: "character varying",
    nullable: true
  })
  phone;

  @Column({
    comment: "salt for password",
    type: "character varying",
    nullable: true
  })
  salt;

  @Column({
    comment: "user role 1. customer 2. merchant 3. root",
    type: "smallint",
    default: 1
  })
  role;

  @Column({
    comment: "user`s garage",
    type: "character varying",
    nullable: true
  })
  garage;

  @Column({ comment: "user`s area", type: "character varying", nullable: true })
  area;

  @Column({ comment: "user`s city", type: "character varying", nullable: true })
  city;

  @OneToMany(type => Comment, comment => comment.belongto)
  comments;

  static retrievePassword({ phone, password }) {
    return User.findOne({
      where: { phone }
    }).then(currentUser => {
      if (!currentUser) throw new Error("用户不存在");

      const { hashed, salt } = hashPassword(password);
      currentUser.salt = salt;
      currentUser.password = hashed;
      return currentUser.save();
    });
  }

  static checkIfExists(phone) {
    return User.findOne({
      where: {
        phone
      }
    }).then(res => !!res);
  }
}
