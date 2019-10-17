import { getManager } from 'typeorm';
import { Order } from '../../graphql/order/order.entity';
import logger from '../../helper/logger';
import { OrderStatus, PaymentStatus } from '../../helper/status';
import { Payment } from '../../graphql/payment/payment.entity';

/**
 *  根据订单号获取订单
 * @param  {number} orderNumber 订单号
 */
const getOrder = orderNumber => Order.createQueryBuilder('order')
  .where('order.orderNumber = :orderNumber', {
    orderNumber,
  })
  .getOne();

export default async function handleOrderAlipayNotify({
  orderNumber,
  payment,
}) {
  return getManager().transaction(async (trx) => {
    logger.info('开始处理订单支付宝回调');
    const order = await getOrder(orderNumber);
    order.status = OrderStatus.WAIT_SHIP;
    logger.info('修改对应的支付记录为已支付');
    await trx.update(Payment, payment.id, { paymentStatus: PaymentStatus.PAID });
    logger.info('修改订单状态为待发货');
    await trx.save(order);
    logger.info('结束处理订单支付宝回调');
  });
}
