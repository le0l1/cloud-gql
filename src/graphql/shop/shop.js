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
    const categoryEntitles = await Promise.all(
      categories.map(c => Category.findOneOrFail(decodeNumberId(c))),
    );
    const bannerEntities = shopBanners.map(b => Banner.create({
      path: b,
      shop,
    }));
    const imageEntities = shopImages.map(i => Image.create({
      path: i,
      shop,
    }));

    await trx.save(phonesEntities);
    await trx.save(bannerEntities);
    await trx.save(imageEntities);
    await trx.save(
      Shop.merge(shop, {
        categories: categoryEntitles,
      }),
    );
  }

  static async rmOldRelations(trx, shop) {
    const oldPhones = await Phone.find({ shop });
    const oldBanners = await Banner.find({ shop });
    const oldImages = await Image.find({ shop });
    await trx.remove(oldPhones);
    await trx.remove(oldImages);
    await trx.remove(oldBanners);
  }

  static async createShop({
    belongto,
    phones = [],
    categories = [],
    shopBanners = [],
    shopImages = [],
    ...rest
  }) {
    if (
      rest.name
      && (await Shop.findOne({
        name: rest.name,
      }))
    ) {
      throw new DumplicateShopNameError();
    }
    const user = await User.findOneOrFail(decodeNumberId(belongto));
    return getManager().transaction(async (trx) => {
      const shop = await trx.save(
        Shop.create({
          rest,
          user,
          cover: shopBanners[0] || null,
          phone: phones[0] || null,
        }),
      );
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
    phones = [],
    categories = [],
    shopBanners = [],
    shopImages = [],
    ...rest
  }) {
    const realId = decodeNumberId(id);
    if (
      rest.name
      && (await Shop.findOne({
        name: rest.name,
        id: Not(realId),
      }))
    ) {
      throw new DumplicateShopNameError();
    }
    const shop = await Shop.findOneOrFail(realId);
    return getManager().transaction(async (trx) => {
      const params = {
        phones,
        categories,
        shopBanners,
        shopImages,
      };
      await trx.save(
        Shop.merge(shop, { ...rest, cover: shopBanners[0] || null, phone: phones[0] || null }),
      );
      await ShopResolver.rmOldRelations(trx, shop);
      await ShopResolver.storeShopRelation(trx, shop, params);
      return shop;
    });
  }

  static async searchShop({ id, user }) {
    if (!user) {
      return Shop.findOneOrFail({
        where: {
          id: decodeNumberId(id),
          deletedAt: null,
        },
        relations: ['categories'],
      });
    }
    const owner = await User.findOneOrFail(decodeNumberId(user));
    return Shop.findOneOrFail({
      where: {
        user: owner,
        deletedAt: null,
      },
      relations: ['categories'],
    });
  }

  static async searchShops({
    tsQuery,
    city,
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
      where('shop.city = :city', {
        city,
      }),
      where('(shop.name like :tsQuery)', {
        tsQuery: tsQuery ? `%${tsQuery}%` : null,
      }),
      where('shop.status = :status', { status: filter.status }),
      where('shop.isPassed = :isPassed', { isPassed }),
      where('shop.city = :city', { city }),
      where('category.id = :categoryId', {
        categoryId: categoryId ? decodeNumberId(categoryId) : null,
      }),
      where('shop.deletedAt is null'),
      withRelation,
      withPagination(limit, offset),
      getManyAndCount,
    )(Shop);
  }

  static async deleteShop({ id }) {
    return getManager().transaction(async (trx) => {
      const shop = await Shop.findOneOrFail(decodeNumberId(id));
      const merchant = await User.findOneOrFail(decodeNumberId(shop.user));
      merchant.deletedAt = new Date();
      shop.deletedAt = new Date();
      await trx.save(User, merchant);
      return trx.save(Shop, shop);
    });
  }

  static searchShopCity() {
    return Shop.createQueryBuilder()
      .select(' DISTINCT city', 'city')
      .getRawMany()
      .then(res => res.reduce((a, b) => (b.city ? [...a, b.city] : a), []));
  }
}
