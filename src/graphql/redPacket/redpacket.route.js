import Router from 'koa-router';
import makeAlipayNotify from './alipay.notify';
import makeWXPayNofity from './wxpay.notify';

const router = new Router();
makeAlipayNotify(router);
makeWXPayNofity(router);

export default router;
