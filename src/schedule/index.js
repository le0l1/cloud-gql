import schedule from 'node-schedule';
import { createConnection } from 'typeorm';
import orderSchedule from './orderSchedule';
import transferSchedule from './transferSchedule';
import statisticsSchedule from './statisticsSchedule';
import offerSchedule from './offerSchedule';

createConnection().then(() => {
  schedule.scheduleJob('*/30 * * * *', transferSchedule);
  schedule.scheduleJob('* */1 * * *', orderSchedule);
  schedule.scheduleJob('30 23 * * *', statisticsSchedule);
  schedule.scheduleJob('* */1 * * *', offerSchedule);
});
