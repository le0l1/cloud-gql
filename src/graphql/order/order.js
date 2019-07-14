import { getManager } from 'typeorm';
import { format, addMinutes } from 'date-fns';
import { User } from '../user/user.entity';
import { decodeNumberId, pipe, env } from '../../helper/util';
import { Good } from '../good/good.entity';
import { Coupon } from '../coupon/coupon.entity';
import Address from '../address/address.entity';
import { Order } from './order.entity';
import { OrderDetail } from './orderDetail.entity';
import { Payment } from '../payment/payment.entity';
import { WXPay } from '../payment/wxpay';
import {
  withPagination, getManyAndCount, where, getQB, getMany,
} from '../../helper/sql';
import {
  StockLackError,
  OrderStatusError,
  OrderPaidExpiredError,
  OrderNotExistsError,
  RefundFailError,
} from '../../helper/error';
import { OrderStatus } from '../../helper/status';
import { OrderLog } from './orderLog.entity';
import logger from '../../helper/logger';

export default class OrderResolver {
  static async createOrder({
    userId, goodArr = [], couponIds = [], addressId,
  }) {
    return getManager().transaction(async (trx) => {
      const user = await User.findOneOrFail(decodeNumberId(userId));
      const goods = await OrderResolver.inspectGoodStock(goodArr, trx);
      const coupons = await Promise.all(
        couponIds.map(couponId => Coupon.findOneOrFail(decodeNumberId(couponId))),
      );
      const address = await Address.findOneOrFail(decodeNumberId(addressId));
      // 计算金额
      const totalCount = goods.reduce(
        (a, b) => a + Number(b.quantity) * Number(b.good.goodSalePrice),
        0,
      );
      const discount = coupons.reduce((a, b) => a + Number(b.discount), 0);

      // 创建订单
      const orderNumber = OrderResolver.makeRecordNumber();
      const order = Order.create({
        discount,
        totalCount,
        orderNumber,
        userId: user.id,
        addressId: address.id,
        payExpiredAt: addMinutes(new Date(), env('ORDER_COUNTDOWN')),
      });
      await trx.save(order);

      // 创建订单详情
      const orderDetail = goods.map(({ good, quantity }) => OrderDetail.create({
        shopId: good.shopId,
        goodId: good.id,
        goodCover: good.cover,
        goodSalePrice: good.goodSalePrice,
        goodName: good.name,
        orderId: order.id,
        quantity,
      }));
      await trx.save(orderDetail);
      // 返回订单信息
      return order;
    });
  }

  /**
   * 支付订单
   */
  static payOrder({ id: orderId, paymentMethod }) {
    return getManager().transaction(async (trx) => {
      const order = await Order.findOneOrFail(decodeNumberId(orderId));
      if (order.status !== OrderStatus.PENDING) {
        throw new OrderStatusError();
      }
      if (order.payExpiredAt < Date.now()) {
        throw new OrderPaidExpiredError();
      }
      const totalFee = Number(order.totalCount) - Number(order.discount);
      const payment = Payment.create({
        totalFee,
        paymentMethod,
      });
      await trx.save(payment);
      await trx.update(Order, order.id, { paymentId: payment.id });
      return new WXPay()
        .setOrderNumber(order.orderNumber)
        .setTotalFee(totalFee)
        .preparePayment();
    });
  }

  // 检查并减少商品库存
  static inspectGoodStock(goodArr, trx) {
    return Promise.all(
      goodArr.map(async ({ goodId, quantity }) => {
        const good = await Good.findOneOrFail(decodeNumberId(goodId));
        if (good.goodsStocks < quantity) throw new StockLackError();
        await trx.update(Good, good.id, { goodsStocks: () => `goods_stocks - ${quantity}` });
        return {
          good,
          quantity,
        };
      }),
    );
  }

  static makeRecordNumber() {
    return `T${format(new Date(), 'YYYYMMDDHHmm')}${Math.floor(Math.random() * 1000000)}`;
  }

  static async searchOrders({
    userId, shopId, limit, offset, status,
  }) {
    const qb = Order.createQueryBuilder('order').leftJoinAndMapMany(
      'order.orderDetail',
      OrderDetail,
      'orderDetail',
      'orderDetail.orderId = order.id',
    );
    return pipe(
      where('order.status = :orderStatus', { status }),
      where('order.userId = :userId', { userId: userId ? decodeNumberId(userId) : null }),
      where('orderDetail.shopId = :shopId', { shopId: shopId ? decodeNumberId(shopId) : null }),
      where('order.deletedAt is null'),
      withPagination(limit, offset),
      getManyAndCount,
    )(qb);
  }

  /**
   * 查询订单详情
   * @param {*} id 订单id
   */
  static async searchOrder(id) {
    const order = await Order.createQueryBuilder('order')
      .leftJoinAndMapMany(
        'order.orderDetail',
        OrderDetail,
        'orderDetail',
        'orderDetail.orderId = order.id',
      )
      .where('order.id = :id', { id: decodeNumberId(id) })
      .where('order.deletedAt is null')
      .getOne();
    /**
     * 当订单状态为待支付且支付已过期
     * 则更新订单状态为已取消
     */
    if (order.status === OrderStatus.PENDING && order.payExpiredAt < Date.now()) {
      return Order.merge(order, { status: OrderStatus.CANCELED }).save();
    }
    return order;
  }

  /**
   * 更新订单状态
   * @param {} param0
   */
  static updateOrder({ id, status, description }) {
    return getManager().transaction(async (trx) => {
      const order = await Order.findOneOrFail(decodeNumberId(id));
      // 记录状态历史记录
      await trx.save(
        OrderLog.create({
          orderId: order.id,
          oldStatus: order.status,
          newStatus: status,
          description,
        }),
      );
      await trx.update(Order, order.id, { status });
      return order;
    });
  }

  static async deleteOrder(id) {
    const order = await Order.findOneOrFail(decodeNumberId(id));
    return Order.merge(order, { deletedAt: new Date() }).save();
  }

  /**
   * 查询订单日志
   */
  static searchOrderLog({ id, newStatus }) {
    return pipe(
      getQB('orderLog'),
      where('orderLog.orderId = :order', { order: decodeNumberId(id) }),
      where('orderLog.newStatus = :newStatus', { newStatus }),
      getMany,
    )(OrderLog);
  }

  /**
   * 订单退款
   * @param id 订单id
   */
  static refundOrder(id) {
    return getManager().transaction(async (trx) => {
      const order = await Order.createQueryBuilder('order')
        .leftJoinAndMapMany(
          'order.orderDetail',
          OrderDetail,
          'orderDetail',
          'orderDetail.orderId = order.id',
        )
        .leftJoinAndMapOne('order.payment', Payment, 'payment', 'payment.id = order.paymentId')
        .where('order.id = :id', { id: decodeNumberId(id) })
        .getOne();
      if (!order) throw new OrderNotExistsError();
      // 还原库存
      await Promise.all(
        order.orderDetail.map(({ goodId, quantity }) => trx.update(Good, goodId, { goodsStocks: () => `goods_stocks + ${quantity}` })),
      );
      // 退款
      const { xml } = await WXPay.refund(order.orderNumber, Number(order.payment.totalFee));
      if (xml.return_code !== 'SUCCESS') throw new RefundFailError(xml.return_msg);
      // 更改订单为 已取消
      order.status = OrderStatus.CANCELED;
      return trx.save(order);
    });
  }
}
