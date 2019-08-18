import { User } from '../user/user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { GoldProduct } from '../goldProduct/goldProduct.entity';
import { GoldLackError } from '../../helper/error';
import {
  getQB, where, withPagination, getManyAndCount,
} from '../../helper/sql';
import { GoldOrder } from './goldOrder.entity';
import { Banner } from '../banner/banner.entity';
import Address from '../address/address.entity';

export default class GoldOrderResolver {
  static async createGoldOrder({ userId, goldProductId, addressId }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    const goldProduct = await GoldProduct.findOneOrFail(decodeNumberId(goldProductId));
    const address = await Address.findOneOrFail(decodeNumberId(addressId));
    if (user.gold < goldProduct.salePrice) throw new GoldLackError();
    return GoldOrder.save({
      userId: user.id,
      goldProductId: goldProduct.id,
      addressId: address.id,
    });
  }

  static async updateGoldOrder({ id, status }) {
    const goldProductOrder = await GoldOrder.findOneOrFail(decodeNumberId(id));
    return GoldOrder.merge(goldProductOrder, { status }).save();
  }

  static searchGoldOrders({ limit, offset, status, userId }) {
    return pipe(
      getQB('goldOrder'),
      where('goldOrder.status  = :status', { status }),
      where('goldOrder.deletedAt is null'),
      where('goldOrder.userId = :userId', { userId: decodeNumberId(userId) }),
      withPagination(limit, offset),
      getManyAndCount,
    )(GoldOrder);
  }

  static async searchGoldOrder(id) {
    const goldOrder = await GoldOrder.createQueryBuilder('goldOrder')
      .leftJoinAndMapOne('goldOrder.user', User, 'user', 'user.id = goldOrder.userId')
      .leftJoinAndMapOne('goldOrder.address', Address, 'address', 'address.id = goldOrder.addressId')
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
