import { getManager } from 'typeorm';
import fs from 'fs';
import AlipaySdk from 'alipay-sdk';
import { env } from '../../helper/util';
import { RedPacket } from './redPacket.entity';
import { Payment } from '../payment/payment.entity';
import { PaymentStatus } from '../../helper/status';
import logger from '../../helper/logger';
import { RedPacketRecord } from './redPacketRecord.entity';

export default (router) => {
  router.post(env('REDPACKET_ALIPAY_URL'), ctx => getManager().transaction(async (trx) => {
    logger.info(`开始处理支付宝红包回调:${ctx.query}`);
    const redPacket = await RedPacket.createQueryBuilder('redPacket')
      .leftJoinAndMapOne(
        'redPacket.payment',
        Payment,
        'payment',
        'redPacket.paymentId = payment.id',
      )
      .where('redPacket.orderNumber = :orderNumber', {
        orderNumber: ctx.query.out_trade_no,
      })
      .getOne();

    const alipay = new AlipaySdk({
      alipayPublicKey: fs.readFileSync(env('ALIPAY_PUBLIC_KEY'), 'ascii'),
    });

    // 校验订单状态, 防止重复处理
    if (redPacket.payment.status !== PaymentStatus.PENDING) {
      logger.warn(`红包 ${redPacket.orderNumber}已处理, 请勿重复处理!`);
      return 'success';
    }

    // 支付回调验签, 如果失败则支付异常
    if (!alipay.checkNotifySign(ctx.query)) {
      const failReason = `红包 ${redPacket.orderNumber} 验签失败! 更改交易支付状态为异常`;
      await trx.update(Payment, redPacket.paymentId, { status: PaymentStatus.ODD });
      logger.warn(failReason);
      return 'success';
    }

    // 检查订单金额与支付金额是否匹配
    if (Number(redPacket.totalFee) !== Number(ctx.query.total_amount)) {
      const totalCount = Number(ctx.query.total_amount);
      const msg = `红包 ${redPacket.orderNumber} 金额不匹配,修改金额为: ${totalCount}`;
      await trx.update(RedPacket, redPacket.id, { totalFee: totalCount });
      await trx.update(Payment, redPacket.paymentId, { status: PaymentStatus.ODD });
      logger.warn(msg);
      return 'success';
    }
    const average = redPacket.totalFee / redPacket.quantity;
    const redPacketRecords = Array.from({
      length: redPacket.quantity,
    }).map(() => RedPacketRecord.create({
      redPacketId: redPacket.id,
      totalFee: average,
    }));
    await trx.save(RedPacketRecord, redPacketRecords);
    await trx.update(Payment, redPacket.paymentId, { paymentStatus: PaymentStatus.PAID });
    logger.info('处理支付宝红包回调结束');
    return 'success';
  }));
};
