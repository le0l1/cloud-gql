import fs from 'fs';
import AlipaySdk from 'alipay-sdk';
import { sign } from 'alipay-sdk/lib/util';
import AliPayFormData from 'alipay-sdk/lib/form';
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

  /**
   * 设置回调
   */
  setNotifyUrl(url) {
    this.params.notify_url = url;
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

  pagePay() {
    this.params.method = 'alipay.trade.page.pay';
    this.params.bizContent.product_code = 'FAST_INSTANT_TRADE_PAY';
    const formData = new AliPayFormData();
    Object.keys(this.params).forEach((k) => {
      formData.addField(k, this.params[k]);
    });
    formData.setMethod('get');
    return new AlipaySdk({
      appId: env('ALIPAY_APP_ID'),
      privateKey: fs.readFileSync(env('ALIPAY_PRIVATE_KEY'), 'ascii'),
    }).pageExec('alipay.trade.page.pay', { formData });
  }
}
