import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Images extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "character varying",
    nullable: true,
    name: "image_path"
  })
  imagePath;

  @Column({
    type: "character varying",
    name: "image_type",
    nullable: true
  })
  imageType;

  @Column({
    type: "int",
    name: "image_type_id",
    nullable: true
  })
  imageTypeId;

  static createImages(imageType, imageTypeId, images = []) {
    const imagesGroup = images.map(path =>
      Images.create({
        imageType,
        imageTypeId,
        imagePath: path
      })
    );
    return Images.save(imagesGroup);
  }
}
