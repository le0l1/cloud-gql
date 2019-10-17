
import Router from 'koa-router';
import makeAliPayNotify from './alipay';
import makeWXPayNotify from './wxpay';

const router = new Router();


makeAliPayNotify(router);
makeWXPayNotify(router);

export default router;
