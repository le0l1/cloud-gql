import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { decodeIDAndType } from "../../helper/id";

@Entity()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "character varying",
    nullable: true
  })
  path;

  @Column({
    type: "character varying",
    name: "image_type",
    nullable: true
  })
  imageType;

  @Column({
    type: "character varying",
    name: "image_type_id",
    nullable: true
  })
  imageTypeId;

  static createImageArr(imageType, imageTypeId, imageArr = []) {
    const transformImage = node => {
      return {
        path: node,
        imageType,
        imageTypeId
      };
    };
    // delete old images every time
    Image.delete({
      imageType,
      imageTypeId
    });
    Image.save(imageArr.map(transformImage));
  }

  static searchImages({ imageTypeId }) {
    const [type, id] = decodeIDAndType(imageTypeId);
    return Image.find({
      where: {
        imageType: type,
        imageTypeId: id
      }
    });
  }
}
