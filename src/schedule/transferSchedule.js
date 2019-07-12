import schedule from 'node-schedule';
import { createConnection, getManager } from 'typeorm';
import { User } from '../graphql/user/user.entity';
import Logger from '../helper/logger';
import { Transfer } from '../graphql/transfer/transfer.entity';
import { TransferStatus, PaymentStatus } from '../helper/status';

process.env.NODE_ENV = 'development';

// 每30分钟处理一次转账
createConnection().then(() => {
  schedule.scheduleJob('*/30 * * * *', async () => {
    await getManager().transaction(async (trx) => {
      Logger.info('开始处理转账中并且支付成功的交易');
      const transfers = await trx
        .getRepository(Transfer)
        .createQueryBuilder('transfer')
        .leftJoinAndSelect('transfer.payment', 'payment')
        .leftJoinAndSelect('transfer.payee', 'payee')
        .where('payment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAID })
        .andWhere('transfer.status = :transferStatus', { transferStatus: TransferStatus.TRANSFERING })
        .getMany();
      Logger.info('获得当前处理的交易记录集合:', transfers);
      await Promise.all(
        transfers.map(async (t) => {
          Logger.info('处理交易记录:', t.recordNumber);
          Logger.info(`增加用户 ${t.payee.belongto} 余额 ${t.payment.totalFee}`);
          // TODO: 考虑是否加锁 锁定用户余额
          await trx.update(
            User,
            { id: t.payee.belongto },
            { totalFee: () => `total_fee + ${t.payment.totalFee}` },
          );
          await trx.save(Transfer.merge(t, { status: TransferStatus.COMPLETED }));
        }),
      );
    });
  });
});
