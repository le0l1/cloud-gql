import Router from 'koa-router';
import { js2xml } from 'xml-js';
import { getManager } from 'typeorm';
import { mapObjectArr, env } from '../../helper/util';
import { User } from '../user/user.entity';
import { Order } from './order.entity';
import { OrderDetail } from './orderDetail.entity';
import { Shop } from '../shop/shop.entity';
import logger from '../../helper/logger';
import { WXPay } from '../payment/wxpay';
import { OrderStatus, PaymentStatus } from '../../helper/status';
import { Payment } from '../payment/payment.entity';

const router = new Router();

const checkReqStatus = body => !body.return_msg === 'SUCCESS' || !body.return_code === 'OK';
const failResult = js2xml(
  {
    xml: {
      return_msg: {
        _cdata: 'INVALID_REQUEST',
      },
      return_code: {
        _cdata: 'FAIL',
      },
    },
  },
  { compact: true, ignoreComment: true, spaces: 4 },
);

router.post(
  env('WXPAY_ORDER_NOTIFY_URL'),
  async (ctx, next) => {
    ctx.type = 'application/xml';
    const xml = mapObjectArr(ctx.request.body.xml);
    if (checkReqStatus(xml)) {
      ctx.body = failResult;
      return;
    }
    logger.info('校验微信签名');
    // const { sign, ...rest } = xml;
    // const wxpay = new WXPay(rest);
    // if (wxpay.sign !== sign) {
    //   logger.error('微信签名校验失败!');
    //   ctx.body = failResult;
    //   return;
    // }
    await getManager().transaction(async (trx) => {
      const order = await Order.createQueryBuilder('order')
        .leftJoinAndMapMany(
          'order.orderDetail',
          OrderDetail,
          'orderDetail',
          'orderDetail.orderId = order.id',
        )
        .where('order.orderNumber = :orderNumber', {
          orderNumber: xml.out_trade_no,
        })
        .getOne();
      logger.info('检查订单状态:', order.status);
      if (order.status !== OrderStatus.PENDING) {
        return next();
      }
      logger.info('当前订单号:', order.orderNumber);
      logger.info('订单总金额:', order.totalCount);
      logger.info('优惠金额:', order.discount);
      logger.info('微信支付金额(分)', xml.total_fee);
      logger.info(`修改支付记录 ${order.paymentId} 状态为已支付`);
      await trx.update(Payment, order.paymentId, { paymentStatus: PaymentStatus.PAID });
      logger.info(`修改订单 ${order.id} 状态为待发货`);
      // TODO: 如果金额不匹配 则按照实际支付金额处理
      if (Number(order.totalCount) - Number(order.discount) !== Number(xml.total_fee) / 1000) {
        const totalCount = Number(xml.total_fee) / 1000 + Number(order.discount);
        logger.info('订单金额不匹配,修改为实际支付金额 + 优惠金额:', totalCount);
        order.totalCount = totalCount;
      }
      order.status = OrderStatus.WAIT_SHIP;
      await trx.save(order);
      logger.info('订单完成');
      next();
    });
  },
  async (ctx) => {
    const res = js2xml(
      {
        xml: {
          return_msg: {
            _cdata: 'OK',
          },
          return_code: {
            _cdata: 'SUCCESS',
          },
        },
      },
      { compact: true, ignoreComment: true, spaces: 4 },
    );
    ctx.body = res;
  },
);

export default router;
