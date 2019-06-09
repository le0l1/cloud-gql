import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Entity
} from "typeorm";
import { Image } from "../image/image.entity";
import { User } from "../user/user.entity";
import { decodeNumberId } from "../../helper/id";

@Entity()
export class BusinessCircle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "int",
    nullable: true,
    name: "user_id"
  })
  userId;

  @Column({
    type: "character varying",
    nullable: true
  })
  content;

  @Column({
    type: "int",
    default: 0,
    name: "star_count"
  })
  starCount;

  @Column({
    type: "int",
    default: 0,
    name: "comment_count"
  })
  commentCount;

  @Column({
    type: "int",
    default: 1,
    name: "report_status",
    comment: "1: isNotReported, 2: isReported"
  })
  reportStatus;

  @CreateDateColumn({
    name: "created_at"
  })
  createdAt;

  static createBusinessCircle({ userId, images, content }) {
    return BusinessCircle.create({
      userId: decodeNumberId(userId),
      content
    })
      .save()
      .then(({ id }) => {
        BusinessCircle.saveBusinessCircleImages(id, images);
        return {
          id,
          status: true
        };
      });
  }

  static saveBusinessCircleImages(id, images) {
    Image.createImageArr("businessCircle", id, images);
  }

  static searchBusinessCircle({ offset = 1, limit = 10 }) {
    return BusinessCircle.createQueryBuilder("businessCircle")
      .leftJoinAndMapOne(
        "businessCircle.user",
        User,
        "user",
        "user.id = businessCircle.userId"
      )
      .leftJoinAndMapMany(
        "businessCircle.images",
        Image,
        "image",
        `image.imageType = 'businessCircle' and image.imageTypeId = businessCircle.id`
      )
      .skip(Math.max(offset - 1, 0))
      .take(limit)
      .getManyAndCount();
  }
}
