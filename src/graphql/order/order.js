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
  InValidCouponError,
  CouponNotSatisfiedError,
} from '../../helper/error';
import { OrderStatus } from '../../helper/status';
import { OrderLog } from './orderLog.entity';
import logger from '../../helper/logger';

export default class OrderResolver {
  static async createOrder({ userId, orderItems = [], addressId }) {
    return getManager()
      .transaction(async (trx) => {
        const user = await User.findOneOrFail(decodeNumberId(userId));
        const orderNumber = OrderResolver.makeRecordNumber();
        logger.info(`生成订单 ${orderNumber}`);
        const { totalCount, discount, goodSets } = await orderItems.reduce(
          OrderResolver.checkOrderItem(trx),
          {
            totalCount: 0,
            discount: 0,
            goodSets: [],
          },
        );
        logger.info(`订单总金额: ${totalCount}`);
        logger.info(`订单优惠金额: ${discount}`);
        const address = await Address.findOneOrFail(decodeNumberId(addressId));
        const order = Order.create({
          orderNumber,
          discount,
          totalCount,
          userId: user.id,
          addressId: address.id,
          payExpiredAt: addMinutes(new Date(), env('ORDER_COUNTDOWN')),
        });
        await trx.save(order);
        const orderDetails = goodSets.map(g => OrderDetail.create({
          ...g,
          goodId: g.id,
          goodName: g.name,
          goodCover: g.cover,
          orderId: order.id,
        }));
        await trx.save(orderDetails);
        return order;
      })
      .catch((e) => {
        logger.error(`开始回滚： ${e.message}`);
        throw e;
      });
  }

  /**
   * 支付订单
   */
  static payOrder({ id: orderId, paymentMethod }) {
    return getManager()
      .transaction(async (trx) => {
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
        const notifyUrl = env('HOST') + env('WXPAY_ORDER_NOTIFY_URL');
        return new WXPay()
          .setOrderNumber(order.orderNumber)
          .setTotalFee(totalFee)
          .setNotifyUrl(notifyUrl)
          .preparePayment();
      })
      .catch((e) => {
        logger.error(`开始回滚： ${e.message}`);
        throw e;
      });
  }

  /**
   * 检查商品库存及优惠劵使用条件
   * @param {*} goodArr
   * @param {*} trx
   */
  static checkOrderItem(trx) {
    return async (a, { goodArr, couponId }) => {
      const coupon = couponId
        ? await Coupon.findOneOrFail(decodeNumberId(couponId))
        : { discount: 0 };
      let total = 0;
      const goodWithQuantity = await Promise.all(
        goodArr.map(async ({ goodId, quantity }) => {
          const goodInstance = await Good.findOneOrFail(decodeNumberId(goodId));
          logger.info(`计算订单商品id: ${goodInstance.id} `);
          logger.info(`订单商品数量: ${quantity}`);
          logger.info(`商品库存: ${goodInstance.goodsStocks}`);
          logger.info(`商品价格: ${goodInstance.goodSalePrice}`);
          if (goodInstance.goodsStocks < quantity) throw new StockLackError();
          if (coupon.id && goodInstance.shopId !== coupon.shopId) throw new InValidCouponError();
          total += Number(goodInstance.goodSalePrice) * quantity;
          goodInstance.goodsStocks -= quantity;
          goodInstance.goodsSales += quantity;
          logger.info(
            `修改商品库存为${goodInstance.goodsStocks}, 销量为${goodInstance.goodsSales}`,
          );
          await trx.save(goodInstance);
          return { ...goodInstance, quantity };
        }),
      );

      if (coupon.id && total < coupon.biggerThan) {
        throw new CouponNotSatisfiedError();
      }
      const val = a.then ? await a : a;
      return {
        totalCount: val.totalCount + total,
        discount: val.discount + coupon.discount,
        goodSets: val.goodSets.concat(goodWithQuantity),
      };
    };
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
      where('order.status = :status', { status }),
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
