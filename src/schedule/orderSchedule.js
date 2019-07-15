import { getManager } from 'typeorm';
import { Order } from '../graphql/order/order.entity';
import { OrderDetail } from '../graphql/order/orderDetail.entity';
import { OrderStatus, PaymentStatus } from '../helper/status';
import { Payment } from '../graphql/payment/payment.entity';
import { Shop } from '../graphql/shop/shop.entity';
import { User } from '../graphql/user/user.entity';
import logger from '../helper/logger';

const cacluateCake = orderDetail => orderDetail.reduce(
  (a, b) => (a[b.shopId]
    ? {
      ...a,
      [b.shopId]: a[b.shopId] + Number(b.goodSalePrice) * Number(b.quantity),
    }
    : {
      ...a,
      [b.shopId]: Number(b.goodSalePrice) * Number(b.quantity),
    }),
  {},
);

const settleOrder = (cake, trx) => Promise.all(
  Object.keys(cake).map(async (c) => {
    const { belongto: user } = await Shop.findOne(c);
    logger.info(`向用户${user}打入余额  ${cake[c]} 元`);
    await trx
      .createQueryBuilder()
      .update(User)
      .set({
        totalFee: () => `total_fee + ${cake[c]}`,
      })
      .where('id = :id', { id: user })
      .execute();
  }),
);

export default () => getManager().transaction(async (trx) => {
  const orders = await trx
    .getRepository(Order)
    .createQueryBuilder('order')
    .leftJoinAndMapMany(
      'order.orderDetail',
      OrderDetail,
      'orderDetail',
      'orderDetail.orderId = order.id',
    )
    .leftJoinAndMapOne('order.payment', Payment, 'payment', 'order.paymentId = payment.id')
    .where('order.status = :orderStatus', { orderStatus: OrderStatus.FINISH })
    .where('order.isSettled = false')
    .where('payment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAID })
    .getMany();
  if (!orders.length) return;
  await orders.reduce(async (a, b) => {
    const order = a.then ? await a : a;
    logger.info('当前订单号:', order.orderNumber);
    logger.info('订单总金额:', order.totalCount);
    logger.info('优惠金额:', order.discount);
    const cake = cacluateCake(order.orderDetail);
    await settleOrder(cake, trx);
    logger.info('订单清算完成!');
    await trx.update(Order, order.id, { isSettled: true });
    return b;
  });
});
