import { getManager } from 'typeorm';
import { Accessories } from './accessories.entity';
import { Banner } from '../banner/banner.entity';
import { decodeNumberId } from '../../helper/util';

export default class AccessoriesResolver {
  static async createAccessories({ accessoriesImages, ...rest }) {
    return getManager().transaction(async (trx) => {
      const accessories = Accessories.create(rest);
      await trx.save(accessories);
      const banners = accessoriesImages.map(path => Banner.create({
        path,
        accessories,
      }));
      await trx.save(banners);
      return accessories;
    });
  }

  static searchAccessories({ id }) {
    return Accessories.createQueryBuilder('accessories')
      .where({
        id: decodeNumberId(id),
      })
      .getOne();
  }
}
