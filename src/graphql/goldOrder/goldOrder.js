import { User } from '../user/user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { GoldProduct } from '../goldProduct/goldProduct.entity';
import { GoldLackError } from '../../helper/error';
import {
  getQB, where, withPagination, getManyAndCount,
} from '../../helper/sql';
import { GoldOrder } from './goldOrder.entity';
import { Banner } from '../banner/banner.entity';

export default class GoldOrderResolver {
  static async createGoldOrder({ userId, goldProductId }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    const goldProduct = await GoldProduct.findOneOrFail(decodeNumberId(goldProductId));
    if (user.gold < goldProduct.salePrice) throw new GoldLackError();
    return GoldOrder.save({
      userId: user.id,
      goldProductId: goldProduct.id,
    });
  }

  static async updateGoldOrder({ id, status }) {
    const goldProductOrder = await GoldOrder.findOneOrFail(decodeNumberId(id));
    return GoldOrder.merge(goldProductOrder, { status }).save();
  }

  static searchGoldOrders({ limit, offset, status }) {
    return pipe(
      getQB('goldOrder'),
      where('goldOrder.status  = :status', { status }),
      where('goldOrder.deletedAt is null'),
      withPagination(limit, offset),
      getManyAndCount,
    )(GoldOrder);
  }

  static async searchGoldOrder(id) {
    const goldOrder = await GoldOrder.createQueryBuilder('goldOrder')
      .leftJoinAndMapOne('goldOrder.user', User, 'user', 'user.id = goldOrder.userId')
      .where('goldOrder.id = :id', { id: decodeNumberId(id) })
      .getOne();

    goldOrder.goldProduct = await GoldProduct.createQueryBuilder('goldProduct')
      .leftJoinAndMapMany(
        'goldProduct.banners',
        Banner,
        'banner',
        "banner.bannerType = 'goldProduct' and banner.bannerTypeId = goldProduct.id",
      )
      .where('goldProduct.id = :id', { id: goldOrder.goldProductId })
      .getOne();
    return goldOrder;
  }

  static async deleteGoldOrder(id) {
    const goldOrder = await GoldOrder.findOneOrFail(decodeNumberId(id));
    goldOrder.deletedAt = new Date();
    return GoldOrder.save(goldOrder);
  }
}
