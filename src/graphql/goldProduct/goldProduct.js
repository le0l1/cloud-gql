import { getManager } from 'typeorm';
import { Banner } from '../banner/banner.entity';
import { GoldProduct } from './goldProduct.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { getQB, withPagination, getManyAndCount } from '../../helper/sql';

export default class GoldProductResolver {
  static createGoldProduct(params) {
    return getManager().transaction(async trx => GoldProductResolver.storeGoldProduct(params, trx));
  }

  static async storeGoldProduct({ banners = [], ...rest }, trx) {
    const cover = banners[0] || null;
    const goldProduct = await trx.save(GoldProduct, {
      cover,
      ...rest,
    });
    const bannerSets = banners.map(b => Banner.create({
      path: b,
      bannerType: 'goldProduct',
      bannerTypeId: goldProduct.id,
    }));

    await trx.save(Banner, bannerSets);
    return goldProduct;
  }

  static updateGoldProduct({ id, banners = [], ...rest }) {
    return getManager().transaction(async (trx) => {
      const goldProduct = await GoldProduct.findOneOrFail(decodeNumberId(id));
      const oldBanners = await Banner.find({
        bannerType: 'goldProduct',
        bannerTypeId: goldProduct.id,
      });
      await trx.remove(Banner, oldBanners);
      return GoldProductResolver.storeGoldProduct(
        {
          banners,
          ...GoldProduct.merge(goldProduct, rest),
        },
        trx,
      );
    });
  }

  static deleteGoldProduct(id) {
    return getManager().transaction(async (trx) => {
      const goldProduct = await GoldProduct.findOneOrFail(decodeNumberId(id));
      const oldBanners = await Banner.find({
        bannerType: 'goldProduct',
        bannerTypeId: goldProduct.id,
      });
      await trx.remove(Banner, oldBanners);
      return trx.remove(GoldProduct, goldProduct);
    });
  }

  static async searchGoldProducts({ limit, offset }) {
    return pipe(
      getQB('goldProduct'),
      withPagination(limit, offset),
      getManyAndCount,
    )(GoldProduct);
  }

  static async searchGoldProduct(id) {
    return GoldProduct.createQueryBuilder('goldProduct')
      .leftJoinAndMapMany(
        'goldProduct.banners',
        Banner,
        'banner',
        "banner.bannerType = 'goldProduct' and banner.bannerTypeId = goldProduct.id",
      )
      .where('goldProduct.id = :id', { id: decodeNumberId(id) })
      .getOne();
  }
}
