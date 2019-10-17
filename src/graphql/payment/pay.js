import AliPay from './alipay';
import { WXPay } from './wxpay';


export const createPay = (method) => {
  return method === 1 ? new AliPay() : new WXPay();
};
