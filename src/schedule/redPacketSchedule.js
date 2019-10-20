import { getManager } from 'typeorm';
import { RedPacketRecord } from '../graphql/redPacket/redPacketRecord.entity';
import { getQB, getMany, where } from '../helper/sql';
import { pipe } from '../helper/util';
import { User } from '../graphql/user/user.entity';
import logger from '../helper/logger';


function getRedpacketRecords() {
  return pipe(
    getQB('redpacketRecord'),
    where('redpacketRecord.hadSettled = :hadSettled', { hadSettled: false }),
    getMany,
  )(RedPacketRecord);
}

// 进行清算
async function doSettle(redpacketRecord) {
  const user = await User.findOne(redpacketRecord.userId);
  const settleFun = (time = 1) => getManager().transaction(async (trx) => {
    try {
      const { version: oldVersion } = user;
      user.totalFee = Number(user.totalFee) + Number(redpacketRecord.totalFee);
      await trx.save(user);
      await trx.update(RedPacketRecord, redpacketRecord.id, { hadSettled: true });
      if (user.version !== (oldVersion + 1)) {
        throw new Error();
      }
    } catch {
      logger.warn(`红包记录${redpacketRecord.id}更新用户余额失败!尝试第${time}次`);
      if (time < 3) {
        return settleFun(time + 1);
      }
      logger.warn(`红包记录${redpacketRecord.id}更新用户余额失败! 超过最大重试次数`);
    }
  });
  return settleFun();
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
