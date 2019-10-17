import axios from 'axios';
import crypto from 'crypto';
import { env } from './util';
import logger from './logger';

const umengSign = (appSecret, body, url = 'https://msgapi.umeng.com/api/send', method = 'POST') => crypto
  .createHash('md5')
  .update(method + url + JSON.stringify(body) + appSecret)
  .digest('hex');

const doBroadcast = (params, end) => {
  const url = `https://msgapi.umeng.com/api/send?sign=${umengSign(
    end === 'ios' ? env('UMENG_IOS_SECRET') : env('UMENG_ANDORID_SECRET'),
    params,
  )}`;
  axios.post(url, params).then((res) => {
    logger.info(`推送报文: ${JSON.stringify(res.data)}`);
  }).catch((err) => {
    if (err.response) {
      logger.warn(`UMENG ${end}端推送失败, 返回报文:${JSON.stringify(err.response.data)}`);
    }
    logger.warn(`推送失败: ${err}`);
  });
};

const broadcastIOSMessage = (devices, title) => doBroadcast({
  appkey: env('UMENG_IOS_KEY'),
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
  production_mode: 'false',
}, 'ios');

const broadcastAndroidMessage = (devices, title) => doBroadcast({
  appkey: env('UMENG_ANDORID_KEY'),
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
}, 'android');

export const brodcastMessage = (devices, body) => {
  broadcastAndroidMessage(devices, body);
  broadcastIOSMessage(devices, body);
};
