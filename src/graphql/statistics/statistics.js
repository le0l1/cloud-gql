import { isToday, format } from 'date-fns';
import { getManager } from 'typeorm';
import { User } from '../user/user.entity';
import { Order } from '../order/order.entity';
import { Phone } from '../phone/phone.entity';
import { decodeNumberId, pipe, isValid } from '../../helper/util';
import { OrderDetail } from '../order/orderDetail.entity';
import { Statistics } from './statistics.entity';
import { getQB, where, getOne } from '../../helper/sql';
import { Shop } from '../shop/shop.entity';

export default class StatisticsResolver {
  static countUser() {
    return User.count();
  }

  static countOrder(shopId) {
    return shopId
      ? getManager()
        .createQueryBuilder()
        .select('SUM(detail.count)', 'count')
        .from(
          subQuery => subQuery
            .select('COUNT(DISTINCT orderDetail.orderId)', 'count')
            .where('orderDetail.shopId = :shopId', { shopId })
            .from(OrderDetail, 'orderDetail'),
          'detail',
        )
        .getRawOne()
        .then(res => res.count)
      : Order.count();
  }

  static countPhone(shopId) {
    return (shopId
      ? Phone.createQueryBuilder('phone')
        .select('SUM(phone.count)', 'count')
        .where('phone.shop = :shopId', { shopId })
      : Phone.createQueryBuilder().select('SUM(count)', 'count')
    )
      .getRawOne()
      .then(res => res.count);
  }

  static countMoney(shopId) {
    return Shop.findOne({
      where: {
        shop: shopId,
      },
      relations: ['user'],
    }).then(res => (res.user ? res.user.totalFee : 0));
  }

  static async storeShopStatistics(shopId) {
    Statistics.save({
      shopId,
      ...(await StatisticsResolver.countAll(shopId)),
      collectAt: format(new Date(), 'YYYY/MM/DD'),
    });
  }

  static async storeStatistics() {
    Statistics.save({
      ...(await StatisticsResolver.countAll()),
      collectAt: format(new Date(), 'YYYY/MM/DD'),
    });
  }

  static async countAll(shopId) {
    const applyValid = fn => (isValid(shopId) ? fn(shopId) : fn());
    return {
      userCount: await User.count(),
      orderCount: await applyValid(StatisticsResolver.countOrder),
      phoneCount: await applyValid(StatisticsResolver.countPhone),
      moneyCount: await applyValid(StatisticsResolver.countMoney),
    };
  }

  static async searchStatistics({ shopId, date = new Date() }) {
    const shop = shopId ? decodeNumberId(shopId) : null;
    if (isToday(date)) {
      return StatisticsResolver.countAll(shop);
    }
    return pipe(
      getQB('statistics'),
      where('statistics.shopId = :shopId', { shopId: shop }),
      where('statistics.collectAt = :collectAt', { collectAt: format(date, 'YYYY/MM/DD') }),
      getOne,
    )(Statistics);
  }
}
