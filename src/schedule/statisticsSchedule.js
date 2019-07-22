import { Shop } from '../graphql/shop/shop.entity';
import StatisticsResolver from '../graphql/statistics/statistics';
import logger from '../helper/logger';

export default async () => {
  const shops = await Shop.find({
    where: {
      isPassed: true,
    },
  });
  logger.info('统计商户数据');
  shops.map(a => StatisticsResolver.storeShopStatistics(a.id));
  logger.info('统计平台数据');
  StatisticsResolver.storeStatistics();
};
