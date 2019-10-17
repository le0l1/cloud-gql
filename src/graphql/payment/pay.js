import AliPay from './alipay';
import { WXPay } from './wxpay';
import { env } from '../../helper/util';


const setNofityUrl = (pay, paymentMethod) => {
  const notifyUrl = env('HOST') + (paymentMethod === 1 ? env('ALIPAY_NOTIFY_URL') : env('WXPAY_NOTIFY_URL'));
  pay.setNofityUrl(notifyUrl);
  return pay;
};
export const createPay = (method) => {
  const pay = method === 1 ? new AliPay() : new WXPay();
  return setNofityUrl(pay, method);
};
