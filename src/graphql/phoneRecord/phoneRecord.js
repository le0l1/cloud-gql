import { decodeNumberId, pipe } from '../../helper/util';
import PhoneRecord from './phoneRecord.entity';
import {
  getQB, where, withPagination, getManyAndCount, leftJoinAndMapOne,
} from '../../helper/sql';
import { Shop } from '../shop/shop.entity';
import { User } from '../user/user.entity';

/**
 * 创建电话记录
 */
export async function createPhoneRecord({
  phone, userId, isCall, shopId,
}) {
  const shop = await Shop.findOneOrFail(decodeNumberId(shopId));
  const user = await User.findOneOrFail(decodeNumberId(userId));
  const phoneRecord = await PhoneRecord.save({
    phone,
    userId: user.id,
    shopId: shop.id,
    isCall,
  });
  return {
    ...phoneRecord,
    shop,
  };
}

/**
 * 查询电话记录列表
 */
export async function searchPhoneRecords(user, { limit, offset, isCall }) {
  return pipe(
    getQB('phoneRecord'),
    leftJoinAndMapOne('phoneRecord.shop', Shop, 'shop', 'shop.id = phoneRecord.shopId'),
    where('phoneRecord.userId = :userId', { userId: user.id }),
    where('phoneRecord.isCall = :isCall', { isCall }),
    withPagination(limit, offset),
    getManyAndCount,
  )(PhoneRecord);
}
