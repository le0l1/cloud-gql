import { getManager } from 'typeorm';
import { Shop } from '../shop/shop.entity';
import { decodeNumberId } from '../../helper/util';
import { Category } from '../category/category.entity';
import { Banner } from '../banner/banner.entity';
import { Good } from './good.entity';

export default class GoodResolver {
  static createGoods({
    shopId, banners, categories, ...rest
  }) {
    return getManager().transaction(async (trx) => {
      const shop = await Shop.findOneOrFail(decodeNumberId(shopId));
      const good = await trx.save(Good.create({
        shop,
        ...rest,
      }));
      await trx.save(good);
      await GoodResolver.storeReltions(good, trx, { banners, categories });
      return good;
    });
  }

  static async storeReltions(good, trx, params) {
    const banners = val => val.map(a => Banner.create({
      path: a,
      good,
    }));

    const categories = val => Promise.all(val.map(c => Category.findOneOrFail(decodeNumberId(c))));
    const relations = {
      banners,
      categories,
    };
    await Promise.all(Object.keys(params).map(async (k) => {
      const res = await relations[k](params[k]);
      return trx.save(res);
    }));
  }
}
