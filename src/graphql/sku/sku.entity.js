import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index
} from "typeorm";
import { formateID, decodeID, decodeNumberId } from "../../helper/id";

@Entity()
export class Sku extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "character varying",
    name: "sku_attrs"
  })
  skuAttrs;

  @Column({
    type: "character varying",
    name: "sku_code"
  })
  skuCode;

  @Column({
    type: "int",
    name: "good_id"
  })
  goodId;

  @Column({
    type: "numeric",
    name: "sku_price"
  })
  skuPrice;

  static createSku({ skuAttrs, goodId, skuPrice }) {
    const generateSkuCode = (sku, goodId) => {
      return formateID("skuCode", sku.join(","));
    };
    const decodedGoodId = decodeNumberId(goodId);
    const decodedSku = skuAttrs.map(decodeNumberId);
    return Sku.create({
      skuAttrs: JSON.stringify(decodedSku),
      skuCode: generateSkuCode(decodedSku, decodedGoodId),
      goodId: decodedGoodId,
      skuPrice
    })
      .save()
      .then(({ id }) => ({
        id: formateID("sku", id),
        status: true
      }));
  }

  static searchSku({ goodId }) {
    const transformSkuAttrs = obj => {
      const skuAttrs = JSON.parse(obj.skuAttrs);
      return {
        ...obj,
        skuAttrs: skuAttrs ? skuAttrs.map(a => formateID("attribute", a)) : []
      };
    };
    return Sku.find({
      where: {
        goodId: decodeNumberId(goodId)
      }
    }).then(res => {
      return res.map(transformSkuAttrs);
    });
  }
}
