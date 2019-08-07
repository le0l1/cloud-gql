import Router from 'koa-router';
import makeAliPayNotify from './alipay.notify';
import makeWXPayNotify from './wxpay.notify';

const router = new Router();

makeAliPayNotify(router);
makeWXPayNotify(router);

export default router;
