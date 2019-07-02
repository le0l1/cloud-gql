import { getManager } from 'typeorm';
import { Shop } from '../shop/shop.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { Category } from '../category/category.entity';
import { Banner } from '../banner/banner.entity';
import { Good } from './good.entity';
import {
  getQB, where, withPagination, getManyAndCount, leftJoinAndSelect
} from '../../helper/sql';

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

    const categories = async (val) => {
      const categoryEntities = await Promise.all(
        val.map(c => Category.findOneOrFail(decodeNumberId(c))),
      );
      return Good.merge(good, { categories: categoryEntities });
    };
    const relations = {
      banners,
      categories,
    };
    await Promise.all(Object.keys(params).map(async (k) => {
      if (params[k]) {
        const res = await relations[k](params[k]);
        return trx.save(res);
      }
      return null;
    }));
  }

  static async rmOldRetions(good, trx) {
    const banners = await Banner.find({
      good,
    });
    await trx.remove(banners);
  }

  static async searchGood({ id }) {
    return Good.findOneOrFail({
      where: {
        id: decodeNumberId(id),
        deletedAt: null,
      },
      relations: ['categories'],
    });
  }

  static async updateGood({
    id, categories, banners, ...rest
  }) {
    return getManager().transaction(async (trx) => {
      const good = await Good.findOneOrFail(decodeNumberId(id));
      await trx.save(Good.merge(good, rest));
      await GoodResolver.rmOldRetions(good, trx);
      await GoodResolver.storeReltions(good, trx, { categories, banners });
      return good;
    });
  }

  static async searchGoods({
    shopId, offset, limit, tsQuery, categoryId,
  }) {
    return pipe(
      getQB('good'),
      leftJoinAndSelect('good.categories', 'category'),
      where('good.name like :tsQuery', {
        tsQuery: tsQuery ? `%${tsQuery}%` : null,
      }),
      where('good.deletedAt is null'),
      where('good.shop = :shop', { shop: shopId ? decodeNumberId(shopId) : null }),
      where('category.id = :category', { category: categoryId ? decodeNumberId(categoryId) : null }),
      withPagination(limit, offset),
      getManyAndCount,
    )(Good);
  }

  static async deleteGood({
    id,
  }) {
    const good = await Good.findOneOrFail(decodeNumberId(id));
    return Good.merge(good, { deletedAt: new Date() }).save();
  }
}
