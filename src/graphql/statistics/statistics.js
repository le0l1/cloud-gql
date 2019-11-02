import { isToday, format } from 'date-fns';
import { getManager, IsNull, Raw } from 'typeorm';
import { User } from '../user/user.entity';
import { Order } from '../order/order.entity';
import { decodeNumberId, pipe, isValid } from '../../helper/util';
import { OrderDetail } from '../order/orderDetail.entity';
import { Statistics } from './statistics.entity';
import {
  getQB, where, getOne, leftJoinAndSelect,
} from '../../helper/sql';

import { Shop } from '../shop/shop.entity';
import PhoneRecord from '../phoneRecord/phoneRecord.entity';

export default class StatisticsResolver {
  static countUser() {
    return User.count({
      where: {
        createdAt: Raw(alias => `date(${alias}) = '${format(new Date(), 'YYYY-MM-DD')}'`),
        deletedAt: IsNull(),
      },
    });
  }

  static countOrder(shopId) {
    return shopId
      ? getManager()
        .createQueryBuilder()
        .select('SUM(detail.count)', 'count')
        .from(
          subQuery => subQuery
            .leftJoinAndMapMany('order.details', OrderDetail, 'orderDetail', 'orderDetail.orderId = order.id')
            .select('COUNT(1)', 'count')
            .where('orderDetail.shopId = :shopId', { shopId })
            .andWhere('date(order.createdAt) = date(:today)', { today: new Date() })
            .andWhere('order.deletedAt is null')
            .from(Order, 'order'),
          'detail',
        )
        .getRawOne()
        .then(res => res.count || 0)
      : Order.count({
        where: {
          createdAt: Raw(alias => `date(${alias}) = '${format(new Date(), 'YYYY-MM-DD')}'`),
        },
      });
  }

  static countPhone(shopId) {
    return pipe(
      getQB('phoneRecord'),
      qb => qb.select('count(1)', 'count'),
      where('phoneRecord.shopId = :shopId', { shopId }),
      where('date(phoneRecord.createdAt) = date(:today)', { today: new Date() }),
      qb => qb.getRawOne().then(res => res.count),
    )(PhoneRecord);
  }

  static async countMoney(shopId) {
    const countPlatform = pipe(
      getQB('user'),
      qb => qb.select('SUM(user.totalFee)', 'totalFee'),
      qb => qb.getRawOne().then(res => res.totalFee),
    ).bind(null, User);
    const countShop = pipe(
      getQB('shop'),
      leftJoinAndSelect('shop.user', 'user'),
      where('shop.id = :shopId', { shopId }),
      getOne,
      qb => qb.then(res => res.user.totalFee),
    ).bind(null, Shop);
    const yesterdayTotalFee = await pipe(
      getQB('statistics'),
      where('statistics.shopId = :shopId', { shopId }),
      getOne,
      qb => qb.then(res => (res ? res.moneyCount : 0)),
    )(Statistics);
    const todayTotalFee = await (shopId ? countShop() : countPlatform());
    return todayTotalFee - yesterdayTotalFee;
  }

  static async storeShopStatistics(shopId) {
    Statistics.save({
      shopId,
      ...(await StatisticsResolver.countAll(shopId)),
      collectAt: format(new Date(), 'YYYY-MM-DD'),
    });
  }

  static async storeStatistics() {
    Statistics.save({
      ...(await StatisticsResolver.searchPlatformStatistics()),
      collectAt: format(new Date(), 'YYYY-MM-DD'),
    });
  }

  static async countAll(shopId) {
    const applyValid = fn => (isValid(shopId) ? fn(shopId) : fn());
    return {
      userCount: await StatisticsResolver.countUser(),
      orderCount: await applyValid(StatisticsResolver.countOrder),
      phoneCount: await applyValid(StatisticsResolver.countPhone),
      moneyCount: await applyValid(StatisticsResolver.countMoney),
    };
  }

  static async searchStatistics({ shopId, date = new Date() }) {
    const shop = shopId ? decodeNumberId(shopId) : null;
    if (isToday(date)) {
      return shop
        ? StatisticsResolver.searchPlatformStatistics()
        : StatisticsResolver.countAll(shop);
    }
    return pipe(
      getQB('statistics'),
      where('statistics.shopId = :shopId', { shopId: shop }),
      where('statistics.collectAt = :collectAt', { collectAt: format(date, 'YYYY-MM-DD') }),
      getOne,
    )(Statistics);
  }

  static countPlatformMoney() {
    return User.createQueryBuilder('user')
      .select('SUM(user.totalFee', 'totalFee')
      .getRawOne()
      .then(res => res.totalFee);
  }

  static async searchPlatformStatistics() {
    return {
      userCount: await StatisticsResolver.countUser(),
      orderCount: await Order.count({
        where: {
          deletedAt: IsNull(),
        },
      }),
      phoneCount: await PhoneRecord.count(),
      moneyCount: await StatisticsResolver.countPlatformMoney(),
    };
  }
}
