import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Images } from "../images/image.entity";
import { formateID, decodeNumberId } from "../../helper/id";
import {
  handleActionResult,
  handleSuccessResult,
  mergeIfValid
} from "../../helper/util";

@Entity()
export class Accessories extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "character varying",
    nullable: true,
    name: "accessories_name"
  })
  accessoriesName;

  @Column({
    type: "int",
    nullable: true,
    name: "accessories_quantity"
  })
  accessoriesQuantity;

  @Column({
    type: "int",
    nullable: true,
    name: "accessories_category"
  })
  accessoriesCategory;

  static createAccessories({
    accessoriesImages,
    accessoriesCategory,
    ...rest
  }) {
    const params = mergeIfValid(
      {
        ...rest,
        accessoriesCategory: accessoriesCategory
          ? decodeNumberId(accessoriesCategory)
          : null
      },
      {}
    );
    return Accessories.create(params)
      .save()
      .then(({ id }) => {
        Images.createImages("Accessories", id, accessoriesImages);
        return handleSuccessResult("accessories", id);
      });
  }

  static searchAccessories({ id }) {
    return Accessories.createQueryBuilder("accessories")
      .leftJoinAndMapMany(
        "accessories.accessoriesImages",
        Images,
        "images",
        "images.imageTypeId = accessories.id"
      )
      .where({
        id: decodeNumberId(id)
      })
      .getOne()
      .then(res => {
        const accessoriesImages = res.accessoriesImages.map(
          ({ imagePath }) => imagePath
        );
        return {
          ...res,
          accessoriesImages
        };
      });
  }
}
