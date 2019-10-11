import fs from 'fs';
import { getManager } from 'typeorm';
import AliPay from '../payment/alipay';
import { env } from '../../helper/util';
import { Payment } from '../payment/payment.entity';
import logger from '../../helper/logger';
import { PaymentStatus } from '../../helper/status';
import { getOfferRecordByOrderNumber, isProcessed, diffTotalFee } from './offer.route';


// 检查签名
function checkSignature(data) {
  const alipay = new AliPay({
    alipayPublicKey: fs.readFileSync(env('ALIPAY_PUBLIC_KEY'), 'ascii'),
  });
    // 支付回调验签, 如果失败则支付异常
  return alipay.checkNotifySign(data);
}

export default (router) => {
  router.post(env('OFFER_ALIPAY_URL'), ctx => getManager().transaction(async (trx) => {
    const offerRecord = await getOfferRecordByOrderNumber(ctx.body.out_trade_no);
    if (!checkSignature(ctx.body)) {
      logger.warn(`询价订单支付验签失败! 报文信息:${ctx.body}`);
      ctx.body = 'success';
      return;
    }
    if (isProcessed(offerRecord.payment)) {
      logger.warn(`询价订单已支付,请勿重复处理! 报文信息:${ctx.body}`);
      ctx.body = 'success';
      return;
    }
    if (diffTotalFee(offerRecord.offer.offerPrice, ctx.body.total_fee)) {
      logger.warn(`询价订单金额不匹配! 报文信息:${ctx.body}`);
      ctx.body = 'success';
      return;
    }
    await trx.update(Payment, offerRecord.paymentId, { paymentStatus: PaymentStatus.PAID });
    ctx.body = 'success';
  }));
};
