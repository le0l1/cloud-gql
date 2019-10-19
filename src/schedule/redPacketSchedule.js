import { getManager } from 'typeorm';
import { RedPacketRecord } from '../graphql/redPacket/redPacketRecord.entity';
import { getQB, getMany, where } from '../helper/sql';
import { pipe } from '../helper/util';
import { User } from '../graphql/user/user.entity';
import logger from '../helper/logger';


function getRedpacketRecords() {
  const qb = pipe(
    getQB('redpacketRecord'),
    where('redpacketRecord.hadSettled = :hadSettled', { hadSettled: false }),
  )(RedPacketRecord);
  return getMany(qb);
}

// 进行清算
function doSettle(redpacketRecord) {
  const time = 1;
  const settleFun = getManager().transaction(async (trx) => {
    try {
      const user = await User.findOne(redpacketRecord.userId);
      const { version: oldVersion } = user;
      user.totalFee = Number(user.totalFee) + Number(redpacketRecord.totalFee);
      await trx.save(user);
      await trx.update(RedPacketRecord, redpacketRecord, { hadSettled: true });
      if (user.version !== (oldVersion + 1)) {
        throw new Error();
      }
    } catch {
      logger.warn(`红包记录${redpacketRecord.id}更新用户余额失败!尝试第${time}次`);
      if (time < 3) {
        return settleFun();
      }
      logger.warn(`红包记录${redpacketRecord.id}更新用户余额失败! 超过最大重试次数`);
    }
  });
}

export default async () => {
  logger.info('开始清算红包记录!');
  const redpacketRecords = await getRedpacketRecords();
  Promise.all(redpacketRecords.map(doSettle))
    .then(() => {
      logger.info('完成清算红包记录!');
    }).catch((e) => {
      logger.warn(`清算红包记录失败! 错误报文: ${e}`);
    });
};
