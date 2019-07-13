import { decodeTypeAndId, decodeNumberId, pipe } from '../../helper/util';
import { Shop } from '../shop/shop.entity';
import { History } from './history.entity';
import { User } from '../user/user.entity';
import { getQB, leftJoinAndMapOne, where, withPagination, getManyAndCount } from '../../helper/sql';

export default class HistoryResolver {
  static async createHistory({ userId, typeId }) {
    const [type, tId] = decodeTypeAndId(typeId);
    const user = await User.findOneOrFail(decodeNumberId(userId));
    await HistoryResolver.checkTypeExsits(tId);
    return History.save({
      userId: user.id,
      type,
      typeId: tId,
    });
  }

  static checkTypeExsits(id) {
    return Shop.findOneOrFail(id);
  }

  static async searchHisotrys({ userId, offset, limit }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    return pipe(
      getQB('history'),
      leftJoinAndMapOne('history.shop', Shop, 'shop', 'history.typeId = shop.id'),
      where('history.userId = :userId', { userId: user.id }),
      withPagination(limit, offset),
      getManyAndCount,
    )(History);
  }

  static delteHistory(id) {
    const realId = decodeNumberId(id);
    return History.delete(realId).then(() => ({ id: realId }));
  }
}
