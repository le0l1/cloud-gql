import fs from 'fs';
import { getManager } from 'typeorm';
import { env } from '../../helper/util';
import AliPay from '../payment/alipay';
import logger from '../../helper/logger';
import { Order } from './order.entity';
import { OrderDetail } from './orderDetail.entity';
import { OrderStatus } from '../../helper/status';
import { Payment } from '../payment/payment.entity';

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

export default (router) => {
  router.post(env('ALIPAY_NOTIFY_URL'), async ctx => getManager().transaction(async (trx) => {
    const order = await getOrder(ctx.body.out_trade_no);
    const alipay = new AliPay({
      alipayPublicKey: fs.readFileSync(env('ALIPAY_PUBLIC_KEY'), 'ascii'),
    });
    // 校验订单状态, 防止重复处理
    if (order.status !== OrderStatus.PENDING) {
      logger.warn(`订单${order.orderNumber}已处理, 请勿重复处理!`);
      return 'success';
    }
    /**
       * 支付回调验签, 如果失败则支付异常
       */
    if (!alipay.checkNotifySign(ctx.body)) {
      const failReason = `订单 ${order.orderNumber} 验签失败! 更改交易支付状态为异常`;
      logger.warn(failReason);
      await recordUnusalOrder(order, failReason, trx);
      await trx.merge(Order, order, { status: OrderStatus.UNUSUAL }).save();
      return 'success';
    }
    // 检查订单金额与支付金额是否匹配
    if (Number(order.totalCount) - Number(order.discount) !== Number(ctx.body.total_fee) / 100) {
      const totalCount = Number(ctx.body.total_fee) / 100 + Number(order.discount);
      const msg = `订单 ${order.orderNumber} 金额不匹配,修改为实际支付金额 + 优惠金额: ${totalCount}`;
      await recordUnusalOrder(order, msg, trx);
      await trx.merge(Order, order, { status: OrderStatus.UNUSUAL }).save();
      return 'success';
    }
    logger.info(`订单${order.orderNumber}支付成功, 修改订单状态为待发货`);
    order.status = OrderStatus.WAIT_SHIP;
    await trx.update(Payment, order.paymentId, { paymentStatus: PaymentStatus.PAID });
    await trx.save(order);
    return 'success';
  }));
};
