import { env, pipe, mapObjectArr } from '../helper/util';
import logger from '../helper/logger';
import PaymentOrder from './paymentOrder.entity';
import {
  getQB, getOne, where, leftJoinAndMapOne,
} from '../helper/sql';
import { Payment } from '../graphql/payment/payment.entity';
import { hasPaid, wxpayCheckSign, diffTotalFee } from './util';
import handleOrderPayNotify from './handler/order';
import handleOfferPayNotify from './handler/offer';
import handleRedpacketPayNotify from './handler/redpacket';
import handleTransferPayNotify from './handler/transfer';

export default (router) => {
  router.post(env('WXPAY_NOTIFY_URL'), async (ctx) => {
    const xml = mapObjectArr(ctx.request.body.xml);
    logger.info(`开始处理微信支付回调! 订单号:${xml.out_trade_no} 回调报文: ${JSON.stringify(xml)}`);

    const paymentOrder = await pipe(
      getQB('paymentOrder'),
      where('paymentOrder.orderNumber = :orderNumber', { orderNumber: xml.out_trade_no }),
      leftJoinAndMapOne('paymentOrder.payment', Payment, 'payment', 'paymentOrder.paymentId = payment.id'),
      getOne,
    )(PaymentOrder);


    if (hasPaid(paymentOrder.payemnt.paymentStatus)) {
      logger.warn(`订单${paymentOrder.orderNumber}已支付,请勿重复处理!`);
      ctx.body = 'success';
      return;
    }

    if (wxpayCheckSign(xml)) {
      logger.warn(`订单${paymentOrder.orderNumber}支付验签失败!`);
      ctx.body = 'success';
      return;
    }

    if (diffTotalFee(xml.total_fee / 100, paymentOrder.payment.totalFee)) {
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
    logger.info('处理微信支付回调结束');
    ctx.body = 'success';
  });
};
