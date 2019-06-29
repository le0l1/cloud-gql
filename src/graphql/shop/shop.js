import { getManager, Not } from 'typeorm';
import { Shop } from './shop.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { Category } from '../category/category.entity';
import { Phone } from '../phone/phone.entity';
import { Banner } from '../banner/banner.entity';
import { Image } from '../image/image.entity';
import { User } from '../user/user.entity';
import {
  getQB, where, withPagination, getManyAndCount,
} from '../../helper/sql';
import { DumplicateShopNameError } from '../../helper/error';

export default class ShopResolver {
  static async storeShopRelation(trx, shop, {
    phones, categories, shopBanners, shopImages,
  }) {
    const phonesEntities = phones.map(p => Phone.create({
      phone: p,
      shop,
    }));
    const categoryEntitles = await Promise.all(categories.map(
      c => Category.findOneOrFail(decodeNumberId(c)),
    ));
    const bannerEntities = shopBanners.map(b => Banner.create({
      path: b,
      shop,
    }));
    const imageEntities = shopImages.map(i => Image.create({
      path: i,
      shop,
    }));


    await trx.save(phonesEntities);
    await trx.save(Shop.merge(shop, { categories: categoryEntitles }));
    await trx.save(bannerEntities);
    await trx.save(imageEntities);
  }

  static async createShop({
    belongto,
    phones = [], categories = [], shopBanners = [], shopImages = [],
    ...rest
  }) {
    if (rest.name && await Shop.findOne({
      name: rest.name,
    })) {
      throw new DumplicateShopNameError();
    }
    const user = await User.findOneOrFail(decodeNumberId(belongto));
    return getManager().transaction(async (trx) => {
      const shop = await trx.save(Shop.create({
        rest,
        user,
        cover: shopBanners[0] || null,
        phone: phones[0] || null,
      }));
      await ShopResolver.storeShopRelation(trx, shop, {
        phones,
        categories,
        shopBanners,
        shopImages,
      });
      return shop;
    });
  }

  static async updateShop({
    id,
    phones = [], categories = [], shopBanners = [], shopImages = [],
    ...rest
  }) {
    const realId = decodeNumberId(id);
    if (rest.name && await Shop.findOne({
      name: rest.name,
      id: Not(realId),
    })) {
      throw new DumplicateShopNameError();
    }
    const shop = await Shop.findOneOrFail(realId);
    return getManager().transaction(async (trx) => {
      await trx.save(Shop.merge(shop, rest));
      await ShopResolver.storeShopRelation(trx, shop, {
        phones,
        categories,
        shopBanners,
        shopImages,
      });
      return shop;
    });
  }

  static async searchShop({ id }) {
    return Shop.findOneOrFail({
      where: {
        id: decodeNumberId(id),
      },
      relations: ['categories'],
    });
  }

  static async searchShops({
    tsQuery,
    filter = {
      status: null,
    },
    limit,
    offset,
    isPassed,
    categoryId,
  }) {
    const withRelation = query => query.leftJoinAndSelect('shop.categories', 'category');

    return pipe(
      getQB('shop'),
      where('(shop.name like :tsQuery)', {
        tsQuery: tsQuery ? `%${tsQuery}%` : null,
      }),
      where('shop.status = :status', { status: filter.status }),
      where('shop.isPassed = :isPassed', { isPassed }),
      where('category.id = :categoryId', {
        categoryId: categoryId ? decodeNumberId(categoryId) : null,
      }),
      where('deletedAt is :deletedAt', { deletedAt: null }),
      withRelation,
      withPagination(limit, offset),
      getManyAndCount,
    )(Shop);
  }

  static async deleteShop({ id }) {
    const shop = await Shop.findOneOrFail(decodeNumberId(id));
    shop.deletedAt = new Date();
    return shop.save();
  }
}
