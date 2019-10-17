import { getManager } from 'typeorm';
import { Payment } from '../../graphql/payment/payment.entity';
import { PaymentStatus } from '../../helper/status';
import logger from '../../helper/logger';

export default function handleOfferPayNotify({
  payment,
}) {
  return getManager().transaction(async (trx) => {
    logger.info('开始处理报价支付回调');
    logger.info('修改对应的支付记录为已支付');
    await trx.update(Payment, payment.id, { paymentStatus: PaymentStatus.PAID });
    logger.info('结束处理报价支付回调');
  });
}
