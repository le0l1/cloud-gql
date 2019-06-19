import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import {decodeNumberId} from "../../helper/id";

@Entity()
export class Phone extends BaseEntity {
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
        Phone.create({
        phone: p,
        shopId
      })
    );
    Phone.delete({
      where: {
        shopId
      }
    })
    return Phone.save(phoneArr);
  }

  static  searchPhone({ shopId }) {
    return Phone.find({
      where: {
        shopId: decodeNumberId(shopId)
      }
    })
  }
}
