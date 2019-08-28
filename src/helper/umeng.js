import axios from 'axios';
import crypto from 'crypto';
import { env } from './util';

const umengSign = (appSecret, body, url = 'https://msgapi.umeng.com/api/send', method = 'POST') => crypto
  .createHash('md5')
  .update(method + url + JSON.stringify(body) + appSecret)
  .digest('hex');

export const brodcastMessage = () => {
  const params = {
    appkey: env('UMENG_APP_KEY'),
    timestamp: Date.now(),
    type: 'broadcast',
    payload: {
      display_type: 'notification',
      body: {
        ticker: 'Hello World',
        title: 'Hello World',
        text: 'Hello World',
        after_open: 'go_app',
      },
    },
  };
  const url = `https://msgapi.umeng.com/api/send?sign=${umengSign(
    env('UMENG_APP_SECRET'),
    params,
  )}`;
  axios
    .post(url, params)
    .then((res) => {
      console.log('res:', res.data);
    })
    .catch((err) => {
      console.log('err:', err.response);
    });
};
