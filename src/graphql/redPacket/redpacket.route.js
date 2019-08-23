import Router from 'koa-router';
import makeAlipayNotify from './alipay.notify';

const router = new Router();
makeAlipayNotify(router);

export default router;
