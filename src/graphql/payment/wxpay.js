import fs from 'fs';
import path from 'path';
import axios from 'axios';
import https from 'https';
import crypto from 'crypto';
import { js2xml, xml2js } from 'xml-js';
import { env } from '../../helper/util';
import logger from '../../helper/logger';

export class WXPay {
  constructor(basicPayInfo) {
    if (basicPayInfo) {
      this.basicPayInfo = basicPayInfo;
    }
  }

  secretKey = env('WXPAY_SECRET_KEY');

  basicPayInfo = {
    appid: env('WXPAY_APP_ID'),
    mch_id: env('WXPAY_MCH_ID'),
    body: '大风歌-配件交易',
    out_trade_no: '20150806125346',
    total_fee: 0,
    spbill_create_ip: env('WXPAY_IP'),
    notify_url: env('HOST') + env('WXPAY_NOTIFY_URL'),
    trade_type: 'APP',
    nonce_str: WXPay.getNonceStr(),
  };

  static getNonceStr() {
    return Math.floor(Math.random() * 10000000000000000);
  }

  setOrderNumber(orderNumber) {
    this.basicPayInfo.out_trade_no = orderNumber;
    return this;
  }

  /**
   * 元转化为分
   * @param {*} totalFee
   */
  setTotalFee(totalFee) {
    this.basicPayInfo.total_fee = totalFee * 100;
    return this;
  }

  get sign() {
    const sign = `${WXPay.sorByASCII(Object.keys(this.basicPayInfo))
      .reduce((arr, key) => [...arr, `${key}=${this.basicPayInfo[key]}`], [])
      .join('&')}&key=${this.secretKey}`;

    return WXPay.md5(sign).toUpperCase();
  }

  static sorByASCII(arr) {
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

  static md5(data) {
    return crypto
      .createHash('md5')
      .update(data)
      .digest('hex');
  }

  toJSON() {
    return {
      ...this.basicPayInfo,
      sign: this.sign,
    };
  }

  preparePayment() {
    return axios
      .post('https://api.mch.weixin.qq.com/pay/unifiedorder', this.xmlParamter, {
        headers: { 'Content-Type': 'text/xml' },
      })
      .then((res) => {
        const { xml } = xml2js(res.data, { compact: true });
        const {
          appid,
          mch_id: partnerid,
          prepay_id: prepayid,
          nonce_str: noncestr,
          timestamp = Number(
            Date.now()
              .toString()
              .slice(0, 10),
          ),
        } = Object.keys(xml).reduce(
          (a, b) => ({
            ...a,
            // eslint-disable-next-line no-underscore-dangle
            [b]: xml[b]._cdata,
          }),
          {},
        );
        return new WXPay({
          appid,
          partnerid,
          prepayid,
          noncestr,
          timestamp,
          package: 'Sign=WXPay',
        }).toJSON();
      });
  }

  /**
   * 微信退款
   */
  static async refund(orderNumber, totalFee) {
    const instance = new WXPay({
      appid: env('WXPAY_APP_ID'),
      mch_id: env('WXPAY_MCH_ID'),
      nonce_str: WXPay.getNonceStr(),
      out_refund_no: orderNumber,
      total_fee: totalFee * 100,
      refund_fee: totalFee * 100,
    });
    const ca = new https.Agent({
      pfx: fs.readFileSync(env('WXPAY_CERT_FILE')),
      passphrase: instance.basicPayInfo.mch_id,
    });
    const res = await axios.post(
      'https://api.mch.weixin.qq.com/secapi/pay/refund',
      instance.xmlParamter,
      {
        headers: { 'Content-Type': 'text/xml' },
        httpsAgent: ca,
      },
    );
    logger.info(`退款结果: ${res.data}`);
    return xml2js(res.data, { compact: true });
  }
}
