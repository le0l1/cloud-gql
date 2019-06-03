import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Shop } from "./shop.entity";

@Entity()
export class ShopPhone extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "int",
    nullable: true
  })
  phone;
  
  @Column({
    type: 'int',
    name:'shop_id'
  })
  shopId;

  @Column({
    type: 'int',
    default: 100
  })
  count

  static savePhone(phones, shopId) {
    const phoneArr = phones.map(p =>
      ShopPhone.create({
        phone: p,
        shopId
      })
    );
    ShopPhone.delete({
      where: {
        shopId
      }
    })
    return ShopPhone.save(phoneArr);
  }
}
