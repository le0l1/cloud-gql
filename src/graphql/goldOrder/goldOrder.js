import { User } from '../user/user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { GoldProduct } from '../goldProduct/goldProduct.entity';
import { GoldLackError } from '../../helper/error';
import {
  getQB, where, withPagination, getManyAndCount,
} from '../../helper/sql';
import { GoldOrder } from './goldOrder.entity';

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
      withPagination(limit, offset),
      getManyAndCount,
    )(GoldOrder);
  }

  static searchGoldOrder(id) {
    return GoldOrder.createQueryBuilder('goldOrder')
      .leftJoinAndMapOne('goldOrder.user', User, 'user', 'user.id = goldOrder.userId')
      .leftJoinAndMapOne(
        'goldOrder.goldProduct',
        GoldProduct,
        'goldProduct',
        'goldProduct.id = goldOrder.goldProductId',
      )
      .where('goldOrder.id = :id', { id: decodeNumberId(id) })
      .getOne();
  }

  static async deleteGoldOrder(id) {
    const goldOrder = await GoldOrder.findOneOrFail(decodeNumberId(id))
    goldOrder.deletedAt = new Date();
    return GoldOrder.save(goldOrder);
  }
}
