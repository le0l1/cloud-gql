import axios from 'axios';
import crypto from 'crypto';
import { env } from '../../helper/util';
import { js2xml, xml2js } from 'xml-js';

export class WXPay {
  secretKey = env('WXPAY_SECRET_KEY');

  basicPayInfo = {
    appid: env('WXPAY_APP_ID'),
    mch_id: env('WXPAY_MCH_ID'),
    body: '大风歌-配件交易',
    out_trade_no: '20150806125346',
    total_fee: 0,
    spbill_create_ip: env('WXPAY_IP'),
    notify_url: env('WXPAY_NOTIFY_URL'),
    trade_type: 'APP',
    nonce_str: this.getNonce_str(),
  };

  getNonce_str() {
    return Math.floor(Math.random() * 10000000000000000);
  }

  setOrderNumber(orderNumber) {
    this.basicPayInfo.out_trade_no = orderNumber;
    return this;
  }

  setTotalFee(totalFee) {
    this.basicPayInfo.total_fee = totalFee;
    return this;
  }

  get sign() {
    const sign =
      this.sorByASCII(Object.keys(this.basicPayInfo))
        .reduce((arr, key) => {
          return [...arr, `${key}=${this.basicPayInfo[key]}`];
        }, [])
        .join('&') + `&key=${this.secretKey}`;

    return this.md5(sign).toUpperCase();
  }

  sorByASCII(arr) {
    const compareFn = (a, b, index = 0) => {
      if (index > 5) return 1;
      if (a.charCodeAt(index) === b.charCodeAt(index)) return compareFn(a, b, index + 1);
      return a.charCodeAt(index) - b.charCodeAt(index) > 0 ? 1 : -1;
    };
    return arr.sort(compareFn);
  }

  get xmlParamter() {
    return js2xml(
      {
        xml: {
          ...this.basicPayInfo,
          sign: this.sign,
        },
      },
      { compact: true, ignoreComment: true, spaces: 4 },
    );
  }

  md5(data) {
    return crypto
      .createHash('md5')
      .update(data)
      .digest('hex');
  }

  preparePayment() {
    return axios
      .post('https://api.mch.weixin.qq.com/pay/unifiedorder', this.xmlParamter, {
        headers: { 'Content-Type': 'text/xml' },
      })
      .then(res => {
        const { xml } = xml2js(res.data, { compact: true });
        return Object.keys(xml).reduce((a, b) => {
          return {
            ...a,
            [b]: xml[b]._cdata,
          };
        }, {});
      });
  }
}
