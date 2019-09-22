import { User } from '../user/user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import PhoneRecord from './phoneRecord.entity';
import {
  getQB, where, withPagination, getManyAndCount,
} from '../../helper/sql';

/**
 * 创建电话记录
 */
export async function createPhoneRecord({ phone, userId, isCall }) {
  const user = await User.findOneOrFail(decodeNumberId(userId));
  return PhoneRecord.save({
    phone,
    userId: user.id,
    isCall,
  });
}

/**
 * 查询电话记录列表
 */
export async function searchPhoneRecords({ userId, limit, offset }) {
  const user = await User.findOneOrFail(decodeNumberId(userId));
  return pipe(
    getQB('phoneRecord'),
    where('phoneRecord.userId = :userId', { userId: user.id }),
    withPagination(limit, offset),
    getManyAndCount,
  )(PhoneRecord);
}
