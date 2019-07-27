import { format } from 'date-fns';
import { User } from '../user/user.entity';
import { decodeNumberId } from '../../helper/util';
import { CheckIn } from './checkIn.entity';
import { UserHasCheckedError } from '../../helper/error';

export default class CheckInResolver {
  static async checkIn(userId) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    if (await CheckInResolver.hasChecked(user.id)) {
      throw new UserHasCheckedError();
    }
    return CheckIn.save({
      userId: user.id,
    });
  }

  static hasChecked(userId) {
    return CheckIn.createQueryBuilder('checkIn')
      .where('checkIn.userId = :userId', { userId })
      .andWhere('DATE(checkIn.createdAt) = :createdAt', {
        createdAt: format(new Date(), 'YYYY-MM-DD'),
      })
      .getOne();
  }
}
