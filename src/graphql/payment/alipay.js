import fs from 'fs';
import { format } from 'date-fns';
import AlipaySdk from 'alipay-sdk';
import { sign } from 'alipay-sdk/lib/util';
import iconv from 'iconv-lite';
import { env } from '../../helper/util';

export default class AliPay {
  params = {
    app_id: env('ALIPAY_APP_ID'),
    method: 'alipay.trade.app.pay',
    charset: 'utf-8',
    sign_type: 'RSA2',
    format: 'json',
    timestamp: '2019-08-04 11:23:50',
    version: '1.0',
    notify_url: env('HOST') + env('ALIPAY_NOTIFY_URL'),
    bizContent: {
      subject: '线下交易',
    },
  };

  setOrderNumber(orderNumber) {
    this.params.bizContent.out_trade_no = orderNumber;
    return this;
  }

  setTotalFee(totalFee) {
    this.params.bizContent.total_amount = totalFee;
    return this;
  }

  setSubject(subject = 'transfer') {
    this.params.bizContent.subject = subject;
    return this;
  }

  getSign() {
    const alipaySdk = new AlipaySdk({
      appId: env('ALIPAY_APP_ID'),
      privateKey: fs.readFileSync(env('ALIPAY_PRIVATE_KEY'), 'ascii'),
    });

    return sign('alipay.trade.app.pay', this.params, alipaySdk.config);
  }

  /**
   * 获取app 调用支付参数
   */
  getSignStr({ sign: signStr, ...decamelizeParams }) {
    return `${Object.keys(decamelizeParams)
      .sort()
      .map((key) => {
        let data = decamelizeParams[key];
        if (Array.prototype.toString.call(data) !== '[object String]') {
          data = JSON.stringify(data);
        }
        return `${key}=${iconv.encode(data, this.params.charset)}`;
      })
      .join('&')}&sign=${encodeURIComponent(signStr)}`;
  }

  async preparePayment() {
    return {
      alipayInfo: this.getSignStr(this.getSign()),
    };
  }
}
