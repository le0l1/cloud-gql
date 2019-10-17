import fs from 'fs';
import { PaymentStatus } from '../helper/status';
import { WXPay } from '../graphql/payment/wxpay';
import AliPay from '../graphql/payment/alipay';
import { env } from '../helper/util';

// 是否已支付
export function hasPaid(status) {
  return status === PaymentStatus.PAID;
}

// 微信验签
export function wxpayCheckSign(data) {
  const { sign, ...rest } = data;
  return new WXPay(rest).sign === sign;
}

// 支付宝验证
export function alipayCheckSign(data) {
  const alipay = new AliPay({
    alipayPublicKey: fs.readFileSync(env('ALIPAY_PUBLIC_KEY'), 'ascii'),
  });
  return alipay.checkNotifySign(data);
}


// 检查订单价格
export function diffTotalFee(totalFee, orderTotalFee) {
  return Number(orderTotalFee) !== Number(totalFee);
}
