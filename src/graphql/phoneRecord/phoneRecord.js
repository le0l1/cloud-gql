import { getManager } from 'typeorm';
import { decodeNumberId, pipe } from '../../helper/util';
import PhoneRecord from './phoneRecord.entity';
import {
  getQB,
  where,
  withPagination,
  getManyAndCount,
  leftJoinAndMapOne,
  orderBy,
} from '../../helper/sql';
import { Shop } from '../shop/shop.entity';
import { User } from '../user/user.entity';
import { Phone } from '../phone/phone.entity';

/**
 * 创建电话记录
 */
export function createPhoneRecord({ phone, userId, shopId }) {
  return getManager().transaction(async (trx) => {
    const shop = await Shop.findOneOrFail(decodeNumberId(shopId));
    const user = await User.findOneOrFail(decodeNumberId(userId));
    const phoneRecord = await trx.create(PhoneRecord, {
      phone,
      userId: user.id,
      shopId: shop.id,
    }).save();
    const phones = await Phone.find({
      where: {
        shop,
      },
    });
    if (phones.length) {
      const currentPhone = phones.find(a => a.phone === phone) || phones[0];
      currentPhone.count += 1;
      await trx.save(currentPhone);
    }
    return {
      ...phoneRecord,
      shop,
      user,
    };
  });
}

/**
 * 查询电话记录列表
 */
export async function searchPhoneRecords(user, { limit, offset }) {
  return pipe(
    getQB('phoneRecord'),
    leftJoinAndMapOne(
      'phoneRecord.shop',
      Shop,
      'shop',
      'shop.id = phoneRecord.shopId',
    ),
    leftJoinAndMapOne(
      'phoneRecord.user',
      User,
      'user',
      'user.id = phoneRecord.userId',
    ),
    where('phoneRecord.userId = :userId OR shop.user_id = :userId', { userId: user.id }),
    withPagination(limit, offset),
    orderBy({
      'phoneRecord.createdAt': 'DESC',
    }),
    getManyAndCount,
  )(PhoneRecord);
}
