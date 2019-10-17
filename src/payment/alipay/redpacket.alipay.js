import { getManager } from 'typeorm';
import { RedPacket } from '../../graphql/redPacket/redPacket.entity';
import { RedPacketRecord } from '../../graphql/redPacket/redPacketRecord.entity';
import { Payment } from '../../graphql/payment/payment.entity';
import { PaymentStatus } from '../../helper/status';
import logger from '../../helper/logger';

export default function handleRedpacketAlipayNotify({ orderNumber, payment }) {
  return getManager().transaction(async (trx) => {
    logger.info('开始处理红包支付宝回调');
    const redPacket = await RedPacket.createQueryBuilder('redPacket')
      .where('redPacket.orderNumber = :orderNumber', {
        orderNumber,
      })
      .getOne();
    const average = redPacket.totalFee / redPacket.quantity;
    const redPacketRecords = Array.from({
      length: redPacket.quantity,
    }).map(() => RedPacketRecord.create({
      redPacketId: redPacket.id,
      totalFee: average,
    }));
    logger.info('生成对应的红包记录!');
    await trx.save(RedPacketRecord, redPacketRecords);
    logger.info('修改对应的支付记录为已支付');
    await trx.update(Payment, payment.id, {
      paymentStatus: PaymentStatus.PAID,
    });
    logger.info('结束处理红包支付宝回调');
  });
}
