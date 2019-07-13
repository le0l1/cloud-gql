import { getManager } from 'typeorm';
import { format } from 'date-fns';
import { User } from '../user/user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { Good } from '../good/good.entity';
import { Coupon } from '../coupon/coupon.entity';
import Address from '../address/address.entity';
import { Order } from './order.entity';
import { OrderDetail } from './orderDetail.entity';
import { Payment } from '../payment/payment.entity';
import { WXPay } from '../payment/wxpay';
import { Shop } from '../shop/shop.entity';
import {
  withPagination, getManyAndCount, where, getQB,
} from '../../helper/sql';
import { StockLackError } from '../../helper/error';

export default class OrderResolver {
  static async createOrder({
    userId, goodArr = [], couponIds = [], addressId, paymentMethod,
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
      // 实际支付金额
      const totalFee = totalCount - discount;
      // 创建支付信息
      const payment = Payment.create({
        totalFee,
        paymentMethod,
      });
      await trx.save(payment);

      // 创建订单
      const orderNumber = OrderResolver.makeRecordNumber();
      const order = Order.create({
        discount,
        totalCount,
        orderNumber,
        userId: user.id,
        addressId: address.id,
        paymentId: payment.id,
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

      // 返回支付预信息
      return {
        ...order,
        payPrepare: new WXPay()
          .setOrderNumber(orderNumber)
          .setTotalFee(totalFee)
          .preparePayment(),
      };
    });
  }

  // 检查并减少商品库存
  static inspectGoodStock(goodArr, trx) {
    return Promise.all(
      goodArr.map(async ({ goodId, quantity }) => {
        const good = await Good.findOneOrFail(decodeNumberId(goodId));
        if (good.goodsStocks < quantity) throw new StockLackError();
        await trx.update(good, { goodsStocks: 'good_stocks - 1' });
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
    userId, shopId, limit, offset, orderStatus,
  }) {
    const qb = Order.createQueryBuilder('order').leftJoinAndMapMany(
      'order.orderDetail',
      OrderDetail,
      'orderDetail',
      'orderDetail.orderId = order.id',
    );
    return pipe(
      where('order.status = :orderStatus', { orderStatus }),
      where('order.userId = :userId', { userId: userId ? decodeNumberId(userId) : null }),
      where('orderDetail.shopId = :shopId', { shopId: shopId ? decodeNumberId(shopId) : null }),
      where('order.deletedAt is null'),
      withPagination(limit, offset),
      getManyAndCount,
    )(qb);
  }

  static async searchOrder(id) {
    return Order.createQueryBuilder('order')
      .leftJoinAndMapMany(
        'order.goods',
        OrderDetail,
        'orderDetail',
        'orderDetail.orderId = order.id',
      )
      .where('order.id = :id', { id: decodeNumberId(id) })
      .where('order.deletedAt is null')
      .getOne();
  }

  static async updateOrder({ id, orderStatus }) {
    const order = await Order.findOneOrFail(decodeNumberId(id));
    order.status = orderStatus;
    return order.save();
  }

  static async deleteOrder(id) {
    const order = await Order.findOneOrFail(decodeNumberId(id));
    return Order.merge(order, { deletedAt: new Date() }).save();
  }
}
