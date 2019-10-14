import { getManager } from 'typeorm';
import { User } from '../user/user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { InsufficientBalanceError } from '../../helper/error';
import { Withdraw } from './withdraw.entity';
import {
  withPagination, getManyAndCount, getQB, orderBy, where, leftJoinAndMapOne,
} from '../../helper/sql';
import { WithdrawStatus } from '../../helper/status';
import logger from '../../helper/logger';

export default class WithdrawResolver {
  static async createWithdraw({ userId, totalCount, method }) {
    // TODO: 通过绑定记录提现到对应的账号
    const user = await User.findOneOrFail(decodeNumberId(userId));
    if (user.totalFee < totalCount) {
      throw new InsufficientBalanceError();
    }
    return Withdraw.save({
      userId: user.id,
      totalCount,
      method,
    });
  }

  static updateWithdraw({ id, status }) {
    return getManager().transaction(async (trx) => {
      const withdraw = await Withdraw.findOneOrFail(decodeNumberId(id));
      if (status === WithdrawStatus.PASSED) {
        const user = await User.findOneOrFail(withdraw.userId);
        await trx.update(User, user.id, { totalFee: () => `total_fee - ${withdraw.totalCount}` });
        logger.info(`用户${user.id}提现${withdraw.totalCount}元`);
      }
      return trx.merge(Withdraw, withdraw, { status }).save();
    });
  }

  static async searchWithdraws({
    limit, offset, status, userId,
  }) {
    return pipe(
      getQB('withdraw'),
      leftJoinAndMapOne('withdraw.user', User, 'user', 'user.id = withdraw.userId'),
      where('withdraw.status = :status', { status }),
      where('withdraw.userId = :user', { user: userId ? decodeNumberId(userId) : null }),
      withPagination(limit, offset),
      orderBy({
        'withdraw.createdAt': 'DESC',
      }),
      getManyAndCount,
    )(Withdraw);
  }

  static async searchWithdraw(id) {
    return Withdraw.findOneOrFail(decodeNumberId(id));
  }
}
