import { Banner } from './banner.entity';
import { decodeTypeAndId } from '../../helper/util';
import { Shop } from '../shop/shop.entity';
import { Good } from '../good/good.entity';
import { Accessories } from '../accessories/accessories.entity';
import { RFQ } from '../rfq/RFQ.entity';

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
        rfq: BannerResolver.findRFQBanners,
        accessories: BannerResolver.findAccessoriesBanners,
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

  static async findAccessoriesBanners(accessoriesId) {
    const accessories = await Accessories.findOneOrFail(accessoriesId);
    return Banner.find({
      accessories,
    });
  }

  static async findRFQBanners(rfqId) {
    const rfq = await RFQ.findOneOrFail(rfqId);
    return Banner.find({
      rfq,
    });
  }
}
