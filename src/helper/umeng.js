import axios from 'axios';
import crypto from 'crypto';
import { env } from './util';
import logger from './logger';

const umengSign = (appSecret, body, url = 'https://msgapi.umeng.com/api/send', method = 'POST') => crypto
  .createHash('md5')
  .update(method + url + JSON.stringify(body) + appSecret)
  .digest('hex');

const doBroadcast = (params) => {
  const url = `https://msgapi.umeng.com/api/send?sign=${umengSign(
    env('UMENG_APP_SECRET'),
    params,
  )}`;
  axios.post(url, params).then((res) => {
    logger.info(`推送报文: ${JSON.stringify(res.data)}`);
  }).catch((err) => {
    logger.warn(`推送失败: ${err}`);
  });
};

const broadcastIOSMessage = (devices, title) => doBroadcast({
  appkey: env('UMENG_APP_KEY'),
  timestamp: Date.now(),
  type: 'listcast',
  device_tokens: devices.join(','),
  payload: {
    aps: {
      alert: {
        title,
        subtitle: '',
        body: '',
      },
    },
  },
});

const broadcastAndroidMessage = (devices, title) => doBroadcast({
  appkey: env('UMENG_APP_KEY'),
  timestamp: Date.now(),
  type: 'listcast',
  device_tokens: devices.join(','),
  payload: {
    display_type: 'notification',
    body: {
      ticker: title,
      title: '',
      text: '',
      after_open: 'go_app',
    },
  },
});

export const brodcastMessage = (devices, body) => {
  broadcastAndroidMessage(devices, body);
  broadcastIOSMessage(devices, body);
};
