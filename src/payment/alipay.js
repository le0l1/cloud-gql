import { env, pipe } from '../helper/util';
import logger from '../helper/logger';
import { PaymentOrder } from './paymentOrder.entity';
import {
  getQB, getOne, where, leftJoinAndMapOne,
} from '../helper/sql';
import { Payment } from '../graphql/payment/payment.entity';
import { hasPaid, alipayCheckSign, diffTotalFee } from './util';
import handleOrderPayNotify from './handler/order';
import handleOfferPayNotify from './handler/offer';
import handleRedpacketPayNotify from './handler/redpacket';
import handleTransferPayNotify from './handler/transfer';


export default (router) => {
  router.post(env('ALIPAY_NOTIFY_URL'), async (ctx) => {
    const { body } = ctx.request;
    logger.info(`开始处理支付宝支付回调! 订单号:${body.out_trade_no} 回调报文: ${JSON.stringify(body)}`);
    const paymentOrder = await pipe(
      getQB('paymentOrder'),
      leftJoinAndMapOne('paymentOrder.payment', Payment, 'payment', 'paymentOrder.paymentId = payment.id'),
      where('paymentOrder.orderNumber = :orderNumber', { orderNumber: body.out_trade_no }),
      getOne,
    )(PaymentOrder);


    if (hasPaid(paymentOrder.payment.paymentStatus)) {
      logger.warn(`订单${paymentOrder.orderNumber}已支付,请勿重复处理!`);
      ctx.body = 'success';
      return;
    }

    if (alipayCheckSign(body)) {
      logger.warn(`订单${paymentOrder.orderNumber}支付验签失败!`);
      ctx.body = 'success';
      return;
    }

    if (diffTotalFee(body.total_amount, paymentOrder.payment.totalFee)) {
      logger.warn(`订单${paymentOrder.orderNumber}支付金额不匹配!`);
      ctx.body = 'success';
      return;
    }

    const methods = {
      order: handleOrderPayNotify,
      offer: handleOfferPayNotify,
      redpacket: handleRedpacketPayNotify,
      transfer: handleTransferPayNotify,
    };

    if (paymentOrder.orderType in methods) {
      await methods[paymentOrder.orderType](paymentOrder);
    }
    logger.info('处理支付宝红包回调结束');
    ctx.body = 'success';
  });
};
