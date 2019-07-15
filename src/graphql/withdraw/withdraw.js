import { getManager } from 'typeorm';
import { User } from '../user/user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { InsufficientBalanceError } from '../../helper/error';
import { Withdraw } from './withdraw.entity';
import {
  withPagination, getManyAndCount, getQB, orderBy, where,
} from '../../helper/sql';
import { WithdrawStatus } from '../../helper/status';

export default class WithdrawResolver {
  static async createWithdraw({ userId, totalCount, method }) {
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
      // 当提现通过时扣除用户余额
      if (status === WithdrawStatus.PASSED) {
        const user = await User.findOneOrFail(withdraw.userId);
        await trx.update(User, user.id, { totalFee: () => `total_fee - ${withdraw.totalCount}` });
      }
      return trx.merge(Withdraw, withdraw, { status }).save();
    });
  }

  static async searchWithdraws({
    limit, offset, status, userId,
  }) {
    return pipe(
      getQB('withdraw'),
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
