import { getManager, In, Not } from 'typeorm';
import { Shop } from './shop.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { Category } from '../category/category.entity';
import { Phone } from '../phone/phone.entity';
import { Banner } from '../banner/banner.entity';
import { Image } from '../image/image.entity';
import { User } from '../user/user.entity';
import {
  getQB, where, withPagination, getManyAndCount,
  leftJoinAndMapMany,
  orderBy, getOne, leftJoinAndMapOne, leftJoinAndSelect,
} from '../../helper/sql';
import { DumplicateShopNameError } from '../../helper/error';
import { Good } from '../good/good.entity';
import { ShopCategory } from './shopCategory.entity';
import PhoneRecord from '../phoneRecord/phoneRecord.entity';

export default class ShopResolver {
  static async storeShopRelation(trx, shop, {
    phones, categories, shopBanners, shopImages,
  }) {
    const phonesEntities = phones.map(p => Phone.create({
      phone: p,
      shop,
    }));
    const categoryIds = categories.map(c => decodeNumberId(c));
    const oldShopCategories = await ShopCategory.find({
      select: ['categoryId'],
      where: {
        shopId: shop.id,
      },
    });
    const bannerEntities = shopBanners.map(b => Banner.create({
      path: b,
      shop,
    }));
    const imageEntities = shopImages.map(i => Image.create({
      path: i,
      shop,
    }));
    const shopCatgories = categoryIds.reduce((a, category) => {
      if (!oldShopCategories.find(o => o.categoryId === category)) {
        a.push(
          ShopCategory.create({
            shopId: shop.id,
            categoryId: category,
          }),
        );
      }
      return a;
    }, []);

    await trx.save(shopCatgories);
    await trx.save(phonesEntities);
    await trx.save(bannerEntities);
    await trx.save(imageEntities);
  }

  static async rmOldRelations(trx, shop, { categories }) {
    const oldPhones = await Phone.find({ shop });
    const oldBanners = await Banner.find({ shop });
    const oldImages = await Image.find({ shop });
    await trx.delete(ShopCategory, {
      shopId: shop.id,
      // for empty category
      categoryId: Not(In([null, ...categories.map(c => decodeNumberId(c))])),
    });
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
        where: {
          name: rest.name,
          deletedAt: null,
        },
      }))
    ) {
      throw new DumplicateShopNameError();
    }
    const user = await User.findOneOrFail(decodeNumberId(belongto));
    return getManager().transaction(async (trx) => {
      const shop = await trx.save(
        Shop.create({
          user,
          phone: phones[0] || null,
          ...rest,
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
    if (rest.name && await Shop.findOne({
      where: {
        name: rest.name,
        id: Not(realId),
        deletedAt: null,
      },
    })) {
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
        Shop.merge(shop, { ...rest, phone: phones[0] || null }),
      );
      await ShopResolver.rmOldRelations(trx, shop, params);
      await ShopResolver.storeShopRelation(trx, shop, params);
      return shop;
    });
  }

  static async searchShop({ id, user }) {
    let qb = pipe(
      getQB('shop'),
      leftJoinAndMapOne('category.shopCategory', ShopCategory, 'shopCategory', 'shop.id = shopCategory.shopId'),
      leftJoinAndMapMany('shop.categories', Category, 'category', 'category.id = shopCategory.categoryId'),
      leftJoinAndSelect('shop.phones', 'phone'),
      where('shop.id = :id', { id: id ? decodeNumberId(id) : null }),
      where('shop.deletedAt is null'),
    )(Shop);
    if (user) {
      const owner = await User.findOneOrFail(decodeNumberId(user));
      qb = pipe(
        where('shop.user_id = :userId', { userId: owner.id }),
      )(qb);
    }
    return getOne(qb);
  }

  static async searchShops({
    tsQuery,
    city,
    filter = {
      status: null,
      shopType: null,
    },
    limit,
    offset,
    isPassed,
    categoryId,
  }) {
    return pipe(
      getQB('shop'),
      where('shop.deletedAt is null'),
      leftJoinAndMapOne('category.shopCategory', ShopCategory, 'shopCategory', 'shop.id = shopCategory.shopId'),
      leftJoinAndMapMany('shop.categories', Category, 'category', 'category.id = shopCategory.categoryId'),
      leftJoinAndMapMany('shop.phoneRecords', PhoneRecord, 'phoneRecord', 'phoneRecord.shopId = shop.id'),
      leftJoinAndSelect('shop.phones', 'phone'),
      where('shop.city = :city', {
        city,
      }),
      where('(shop.name like :tsQuery or category.name like :tsQuery)', {
        tsQuery: tsQuery ? `%${tsQuery}%` : null,
      }),
      where('shop.status = :status', { status: filter.status }),
      where('shop.shopType = :shopType', { shopType: filter.shopType }),
      where('shop.isPassed = :isPassed', { isPassed }),
      where('shop.city = :city', { city }),
      where('category.id = :categoryId', {
        categoryId: categoryId ? decodeNumberId(categoryId) : null,
      }),
      withPagination(limit, offset),
      orderBy({
        'shopCategory.index': 'ASC',
      }),
      getManyAndCount,
    )(Shop);
  }

  static async deleteShop({ id }) {
    return getManager().transaction(async (trx) => {
      const shop = await Shop.findOneOrFail(decodeNumberId(id));
      const merchant = await User.findOneOrFail(shop.belongto);
      const goods = await Good.find({
        where: {
          shopId: shop.id,
        },
      });
      merchant.deletedAt = new Date();
      shop.deletedAt = new Date();
      await trx.save(User, merchant);
      await trx.save(Good, goods.map(g => ({ ...g, deletedAt: new Date() })));
      return trx.save(Shop, shop);
    });
  }

  static searchShopCity() {
    return Shop.createQueryBuilder()
      .select(' DISTINCT city', 'city')
      .getRawMany()
      .then(res => res.reduce((a, b) => (b.city ? [...a, b.city] : a), []));
  }

  static async updateShopIndex({
    categoryId,
    shopId,
    index,
  }) {
    await ShopCategory.update({
      shopId: decodeNumberId(shopId),
      categoryId: decodeNumberId(categoryId),
    }, { index });
    return true;
  }
}
