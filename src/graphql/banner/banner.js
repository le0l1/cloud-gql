import { Banner } from './banner.entity';
import { decodeTypeAndId } from '../../helper/util';
import { Shop } from '../shop/shop.entity';
import { Good } from '../good/good.entity';

export default class BannerResolver {
  static searchBanners({ tag, bannerTypeId }) {
    if (tag) {
      return Banner.find({
        tag,
      });
    }

    if (bannerTypeId) {
      const [type, typeId] = decodeTypeAndId(bannerTypeId);
      const findMap = {
        shop: BannerResolver.findShopBanners,
        good: BannerResolver.findGoodsBanners,
      };
      return findMap[type] ? findMap[type](typeId) : [];
    }
    return [];
  }

  static async findShopBanners(shopId) {
    const shop = await Shop.findOneOrFail(shopId);
    return Banner.find({
      shop,
    });
  }

  static async findGoodsBanners(goodId) {
    const good = await Good.findOneOrFail(goodId);
    return Banner.find({
      good,
    });
  }
}
