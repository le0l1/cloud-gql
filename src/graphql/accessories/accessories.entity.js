import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { formateID, decodeNumberId, decodeIDAndType } from "../../helper/id";
import {
  handleActionResult,
  handleSuccessResult,
  mergeIfValid
} from "../../helper/util";
import { Banner } from "../banner/banner.entity";

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
        Banner.createBannerArr("accessories", id, accessoriesImages);
        return handleSuccessResult("accessories", id);
      });
  }

  static searchAccessories({ id }) {
    return Accessories.createQueryBuilder("accessories")
      .where({
        id: decodeNumberId(id)
      })
      .getOne();
  }
}
