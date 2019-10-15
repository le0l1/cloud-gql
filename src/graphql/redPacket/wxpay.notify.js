import { getManager } from 'typeorm';
import { RedPacket } from './redPacket.entity';
import { Payment } from '../payment/payment.entity';
import { WXPay } from '../payment/wxpay';
import { env, mapObjectArr } from '../../helper/util';
import logger from '../../helper/logger';
import { PaymentStatus } from '../../helper/status';

function getRedPacketByOrderNumber(orderNumber) {
  return RedPacket.createQueryBuilder('redPacket')
    .leftJoinAndMapOne(
      'redPacket.payment',
      Payment,
      'payment',
      'redPacket.paymentId = payment.id',
    )
    .where('redPacket.orderNumber = :orderNumber', {
      orderNumber,
    })
    .getOne();
}

function checkSignature(data) {
  const { sign, ...rest } = data;
  return new WXPay(rest).sign === sign;
}


// 检查支付状态
function isProcessed(order) {
  return order.status !== PaymentStatus.PENDING;
}

// 检查订单价格
function diffTotalFee(totalFee, orderTotalFee) {
  return Number(orderTotalFee) !== Number(totalFee);
}

export default (router) => {
  router.post(env('REDPACKET_WXPAY_URL'), ctx => getManager().transaction(async (trx) => {
    const xml = mapObjectArr(ctx.request.body.xml);
    const redPacket = await getRedPacketByOrderNumber(xml.out_trade_no);
    if (!checkSignature(xml)) {
      logger.warn(`红包微信支付验签失败,报文信息: ${xml}`);
      ctx.body = 'success';
      return;
    }
    if (isProcessed(redPacket.payment)) {
      logger.warn(`红包微信支付已处理,请勿重复处理! 订单号: ${xml.out_trade_no}`);
      ctx.body = 'success';
      return;
    }
    if (diffTotalFee(redPacket.payment.totalFee, xml.total_fee / 100)) {
      logger.warn(`红包微信支付金额不匹配,报文信息: ${xml}`);
      ctx.body = 'success';
      return;
    }
    await trx.update(Payment, redPacket.paymentId, { paymentStatus: PaymentStatus.PAID });
    ctx.body = 'success';
  }));
};
