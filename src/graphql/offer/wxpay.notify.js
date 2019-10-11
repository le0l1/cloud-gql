import { getManager } from 'typeorm';
import { WXPay } from '../payment/wxpay';
import { getOfferRecordByOrderNumber, isProcessed, diffTotalFee } from './offer.route';
import logger from '../../helper/logger';
import { Payment } from '../payment/payment.entity';
import { PaymentStatus } from '../../helper/status';
import { mapObjectArr, env } from '../../helper/util';

// 检查微信支付签名
function checkSignature(data) {
  const { sign, ...rest } = data;
  return new WXPay(rest).sign === sign;
}


export default (router) => {
  router.post(env('OFFER_WXPAY_URL'), ctx => getManager().transaction(async (trx) => {
    const xml = mapObjectArr(ctx.request.body.xml);
    const offerRecord = await getOfferRecordByOrderNumber(xml.out_trade_no);
    if (!checkSignature(xml)) {
      logger.warn(`询价单微信支付验签失败,报文信息: ${xml}`);
      ctx.body = 'success';
      return;
    }
    if (isProcessed(offerRecord.payment)) {
      logger.warn(`询价单微信支付已处理,请勿重复处理! 订单号: ${xml.out_trade_no}`);
      ctx.body = 'success';
      return;
    }
    if (diffTotalFee(offerRecord.offer.offerPrice, xml.total_fee / 100)) {
      logger.warn(`询价单微信支付金额不匹配,报文信息: ${xml}`);
      ctx.body = 'success';
      return;
    }
    await trx.update(Payment, offerRecord.paymentId, { paymentStatus: PaymentStatus.PAID });
    ctx.body = 'success';
  }));
};
