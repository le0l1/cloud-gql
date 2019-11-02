import { IsNull, Raw } from 'typeorm';
import { format, isToday } from 'date-fns';
import { OrderDetail } from '../order/orderDetail.entity';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';
import PhoneRecord from '../phoneRecord/phoneRecord.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { Statistics } from './statistics.entity';
import { getOne, getQB, where } from '../../helper/sql';
import { Shop } from '../shop/shop.entity';


const formatDate = date => format(date, 'YYYY-MM-DD');
const getToday = () => formatDate(new Date());
// 查询今日用户量
function searchUserCount(today = true) {
  return User.count({
    where: today
      ? { deletedAt: IsNull(), createdAt: Raw(alias => `${alias}::date = ${getToday()}`) }
      : { deletedAt: IsNull() },
  });
}
// 查询今日订单量
function searchTodayOrder({ shopId, today }) {
  function searchPlatformTodayOrder() {
    return Order.count({
      where: today ? {
        createdAt: Raw(alias => `${alias}::date = ${getToday()}`),
        deletedAt: IsNull(),
      } : {
        deletedAt: IsNull(),
      },
    });
  }

  function searchShopTodayOrder() {
    let qb = Order
      .createQueryBuilder('order')
      .leftJoinAndMapMany('order.details', OrderDetail, 'detail', 'detail.orderId = order.id')
      .select('COUNT(1)', 'count')
      .where('detail.shopId = :shopId', { shopId });
    if (today) {
      qb = qb.andWhere('order.deletedAt is null and order.createdAt::date = :today', { today: getToday() });
    }
    return qb
      .getRawOne()
      .then(res => res.count);
  }
  return shopId ? searchShopTodayOrder() : searchPlatformTodayOrder();
}
// 查询今日电话量
function searchPhoneCount({ shopId, today = true }) {
  function searchPlatformTodayPhone() {
    return PhoneRecord.count({
      where: today ? {
        createdAt: Raw(alias => `${alias}::date = ${getToday()}`),
      } : {},
    });
  }
  function searchShopTodayPhone() {
    return PhoneRecord.count({
      where: today ? {
        shopId,
        createdAt: Raw(alias => `${alias}::date = ${getToday()}`),
      } : { shopId },
    });
  }
  return shopId ? searchShopTodayPhone() : searchPlatformTodayPhone();
}
// 查询总余额
function searchMoneyCount(shopId) {
  function searchPlatformMoney() {
    return User.createQueryBuilder('user')
      .select('SUM(user.totalFee)', 'totalFee')
      .getRawOne()
      .then(res => res.totalFee);
  }
  function searchShopMoney() {
    return Shop.createQueryBuilder('shop')
      .leftJoinAndSelect('shop.user', 'user')
      .where('shop.id = :shopId', { shopId })
      .getOne()
      .then(res => res.user.totalFee);
  }
  return shopId ? searchShopMoney() : searchPlatformMoney();
}

async function getTodayStatistics(shopId) {
  return {
    userCount: await searchUserCount(),
    phoneCount: await searchPhoneCount({ shopId, today: true }),
    moneyCount: await searchMoneyCount(shopId),
    orderCount: await searchTodayOrder({ shopId, today: true }),
  };
}

function getSpecifyDateStatistics(shopId, date) {
  return pipe(
    getQB('statistics'),
    where('statistics.shopId = :shopId', { shopId }),
    where('statistics.collectAt = :date', { date: formatDate(date) }),
    getOne,
  )(Statistics);
}

export function handleStatisticsSearch({ shopId, date }) {
  const shop = shopId ? decodeNumberId(shopId) : null;
  function searchStatisticsByDate() {
    if (isToday(date)) return getTodayStatistics(shop);
    return getSpecifyDateStatistics(shop, date);
  }
  async function searchTotalStatistics() {
    return {
      userCount: await searchUserCount(false),
      phoneCount: await searchPhoneCount({ shopId: shop, today: false }),
      moneyCount: await searchMoneyCount(shop),
      orderCount: await searchTodayOrder({ shopId: shop, today: false }),
    };
  }
  return date ? searchStatisticsByDate() : searchTotalStatistics();
}

export async function storeShopStatistics(shopId) {
  return Statistics.save({
    ...(await handleStatisticsSearch({ shopId, date: new Date() })),
    collectAt: getToday(),
  });
}

export async function storeStatistics() {
  return Statistics.save({
    ...(await handleStatisticsSearch()),
    collectAt: getToday(),
  });
}
