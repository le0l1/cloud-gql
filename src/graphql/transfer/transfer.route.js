import Router from 'koa-router';
import makeWxpayNotify from './wxpay.notify';
import makeAlipayNotify from './alipay.notify';

const router = new Router();
makeWxpayNotify(router);
makeAlipayNotify(router);

export default router;
