/* eslint-disable consistent-return */
import fs from 'fs';
import { getManager } from 'typeorm';
import { env } from '../../helper/util';
import AliPay from '../payment/alipay';
import { Transfer } from './transfer.entity';
import { PaymentStatus } from '../../helper/status';
import { Payment } from '../payment/payment.entity';
import logger from '../../helper/logger';

const checkTransferStatus = paymentStatus => paymentStatus === PaymentStatus.PAID;
const failPaid = async (trx, transferRecord) => {
  const { payment } = transferRecord;
  payment.paymentStatus = PaymentStatus.ODD;
  return trx.save(Payment, payment);
};
export default (router) => {
  router.post(env('ALIPAY_NOTIFY_URL'), ctx => getManager().transaction(async (trx) => {
    const transferRecord = await trx
      .getRepository(Transfer)
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.payment', 'payment')
      .where({
        recordNumber: ctx.body.out_trade_no,
      })
      .getOne();
    if (checkTransferStatus(transferRecord.payment.paymentStatus)) {
      logger.info(`交易${transferRecord.recordNumber}已处理! 请勿重复处理`);
      return;
    }
    const alipay = new AliPay({
      alipayPublicKey: fs.readFileSync(env('ALIPAY_PUBLIC_KEY'), 'ascii'),
    });
      /**
       * 支付回调验签, 如果失败则支付异常
       */
    if (!alipay.checkNotifySign(ctx.body)) {
      logger.warn(`转账交易${transferRecord.recordNumber} 验签失败! 更改交易支付状态为异常`);
      failPaid(trx, transferRecord);
      return 'failure';
    }
    /**
       * 校验支付与转账金额是否一致
       * 以及交易记录流水号是否一致
       */
    if (
      ctx.body.total_amount !== transferRecord.payment.totalFee
        || ctx.body.out_trade_no !== transferRecord.recordNumber
    ) {
      logger.warn(
        `转账交易${transferRecord.recordNumber} 金额或交易号不匹配! 更改交易支付状态为异常`,
      );
      failPaid(trx, transferRecord);
      return 'failure';
    }

    /**
       * 校验完成 将交易记录的支付状态改为已支付
       */
    const { payment } = transferRecord;
    payment.paymentStatus = PaymentStatus.PAID;
    trx.save(Payment, payment);
    return 'success';
  }));
  return router;
};
