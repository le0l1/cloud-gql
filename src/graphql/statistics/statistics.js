import { format, isToday } from 'date-fns';
import { OrderDetail } from '../order/orderDetail.entity';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';
import PhoneRecord from '../phoneRecord/phoneRecord.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { Statistics } from './statistics.entity';
import {
  getOne, getQB, leftJoinAndMapMany, where,
} from '../../helper/sql';
import { Shop } from '../shop/shop.entity';


const formatDate = date => format(date, 'YYYY-MM-DD');
const getToday = () => formatDate(new Date());
// 查询今日用户量
function searchUserCount(date) {
  return pipe(
    getQB('user'),
    qb => qb.select('COUNT(1)', 'count'),
    where('date(user.createdAt) = date(:date)', { date }),
    qb => qb.getRawOne().then(res => (res ? res.count : 0)),
  )(User);
}
// 查询今日订单量
function searchTodayOrder({ shopId, date }) {
  function searchPlatformTodayOrder() {
    return pipe(
      getQB('order'),
      qb => qb.select('COUNT(1)', 'count'),
      where('date(order.createdAt) = date(:date)', { date }),
      where('order.deletedAt is null'),
      qb => qb.getRawOne().then(res => (res ? res.count : 0)),
    )(Order);
  }

  function searchShopTodayOrder() {
    return pipe(
      getQB('order'),
      leftJoinAndMapMany('order.details', OrderDetail, 'orderDetail', 'orderDetail.orderId = order.id'),
      qb => qb.select('COUNT(1)', 'count'),
      where('date(order.createdAt) = date(:date)', { date }),
      where('order.deletedAt is null'),
      where('orderDetail.shopId = :shopId', { shopId }),
      qb => qb.getRawOne().then(res => (res ? res.count : 0)),
    )(Order);
  }
  return shopId ? searchShopTodayOrder() : searchPlatformTodayOrder();
}
// 查询今日电话量
function searchPhoneCount({ shopId, date }) {
  function searchPlatformTodayPhone() {
    return pipe(
      getQB('phoneRecord'),
      qb => qb.select('COUNT(1)', 'count'),
      where('date(phoneRecord.createdAt) = date(:date)', { date }),
      qb => qb.getRawOne().then(res => (res ? res.count : 0)),
    )(PhoneRecord);
  }
  function searchShopTodayPhone() {
    return pipe(
      getQB('phoneRecord'),
      qb => qb.select('COUNT(1)', 'count'),
      where('date(phoneRecord.createdAt) = date(:date)', { date }),
      where('phoneRecord.shopId = :shopId', { shopId }),
      qb => qb.getRawOne().then(res => (res ? res.count : 0)),
    )(PhoneRecord);
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
      .then(res => res && res.user ? res.user.totalFee : 0);
  }
  return shopId ? searchShopMoney() : searchPlatformMoney();
}

async function getTodayStatistics(shopId, date) {
  return {
    userCount: await searchUserCount(date),
    phoneCount: await searchPhoneCount({ shopId, date }),
    moneyCount: await searchMoneyCount(shopId),
    orderCount: await searchTodayOrder({ shopId, date }),
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

export function handleStatisticsSearch({ shopId, date = null }) {
  const shop = shopId ? decodeNumberId(shopId) : null;
  async function searchStatisticsByDate() {
    const statistics = await getSpecifyDateStatistics(shop, date);
    if (statistics) return statistics;
    return getTodayStatistics(shop, date);
  }
  async function searchTotalStatistics() {
    return {
      userCount: await searchUserCount(date),
      phoneCount: await searchPhoneCount({ shopId: shop, date }),
      moneyCount: await searchMoneyCount(shop),
      orderCount: await searchTodayOrder({ shopId: shop, date }),
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
