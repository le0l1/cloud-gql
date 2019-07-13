import schedule from 'node-schedule';
import { createConnection } from 'typeorm';
import orderSchedule from './orderSchedule';
import transferSchedule from './transferSchedule';

createConnection().then(() => {
  schedule.scheduleJob('*/30 * * * *', transferSchedule);
  schedule.scheduleJob('* */1 * * *', orderSchedule);
});
