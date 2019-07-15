import Router from 'koa-router';
import { js2xml } from 'xml-js';
import { getManager } from 'typeorm';
import { mapObjectArr, env } from '../../helper/util';
import { Order } from './order.entity';
import { OrderDetail } from './orderDetail.entity';
import { WXPay } from '../payment/wxpay';
import { OrderStatus, PaymentStatus } from '../../helper/status';
import { Payment } from '../payment/payment.entity';
import { OrderLog } from './orderLog.entity';

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
/**
 *  根据订单号获取订单
 * @param  {number} orderNumber 订单号
 */
const getOrder = orderNumber => Order.createQueryBuilder('order')
  .leftJoinAndMapMany(
    'order.orderDetail',
    OrderDetail,
    'orderDetail',
    'orderDetail.orderId = order.id',
  )
  .where('order.orderNumber = :orderNumber', {
    orderNumber,
  })
  .getOne();
/**
 *  记录异常订单
 * @param {*} order 订单实例
 * @param {*} description 描述
 * @param {*} trx 事务实例
 */
const recordUnusalOrder = (order, description, trx) => trx.save(OrderLog, {
  orderId: order.id,
  oldStatus: order.status,
  newStatus: OrderStatus.UNUSUAL,
  description,
});

router.post(
  env('WXPAY_ORDER_NOTIFY_URL'),
  // 处理签名失败
  async (ctx, next) => {
    const xml = mapObjectArr(ctx.request.body.xml);
    if (checkReqStatus(xml)) {
      ctx.body = failResult;
      return;
    }
    const { sign, ...rest } = xml;
    const wxpay = new WXPay(rest);
    if (wxpay.sign !== sign) {
      ctx.failReson = '微信签名校验失败';
    }
    ctx.xml = xml;
    next();
  },
  async (ctx, next) => {
    await getManager().transaction(async (trx) => {
      const { xml } = ctx;
      const order = await getOrder(xml.out_trade_no);
      if (xml.failReson) {
        await recordUnusalOrder(order, xml.failReson, trx);
        await trx.merge(Order, order, { status: OrderStatus.UNUSUAL }).save();
        ctx.body = failResult;
        return;
      }
      if (order.status !== OrderStatus.PENDING) {
        next();
        return;
      }
      if (Number(order.totalCount) - Number(order.discount) !== Number(xml.total_fee) / 1000) {
        const totalCount = Number(xml.total_fee) / 1000 + Number(order.discount);
        const msg = `订单金额不匹配,修改为实际支付金额 + 优惠金额: ${totalCount}`;
        await recordUnusalOrder(order, msg, trx);
        await trx.merge(Order, order, { status: OrderStatus.UNUSUAL }).save();
        next();
        return;
      }
      order.status = OrderStatus.WAIT_SHIP;
      await trx.update(Payment, order.paymentId, { paymentStatus: PaymentStatus.PAID });
      await trx.save(order);
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
