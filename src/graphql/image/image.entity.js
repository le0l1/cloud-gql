import {
  BaseEntity, Entity, PrimaryGeneratedColumn, Column,
  ManyToOne,
} from 'typeorm';
import { decodeIDAndType } from '../../helper/util';
import { Shop } from '../shop/shop.entity';

@Entity()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  path;

  @Column({
    type: 'character varying',
    name: 'image_type',
    nullable: true,
  })
  imageType;

  @Column({
    type: 'int',
    name: 'image_type_id',
    nullable: true,
  })
  imageTypeId;

  @ManyToOne(type => Shop, shop => shop.images)
  shop;

  static createImageArr(imageType, imageTypeId, imageArr = []) {
    const transformImage = node => ({
      path: node,
      imageType,
      imageTypeId,
    });
    // delete old images every time
    Image.delete({
      imageType,
      imageTypeId,
    });
    return Image.save(imageArr.map(transformImage));
  }

  static searchImages({ imageTypeId }) {
    const [type, id] = decodeIDAndType(imageTypeId);
    return Image.find({
      where: {
        imageType: type,
        imageTypeId: id,
      },
    });
  }
}
