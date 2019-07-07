import { getManager } from 'typeorm';
import { format } from 'date-fns';
import { User } from '../user/user.entity';
import { decodeNumberId } from '../../helper/util';
import { Good } from '../good/good.entity';
import { Coupon } from '../coupon/coupon.entity';
import Address from '../address/address.entity';
import { Order } from './order.entity';
import { OrderDetail } from './orderDetail.entity';
import { Payment } from '../payment/payment.entity';
import { WXPay } from '../payment/wxpay';

export default class OrderResolver {
  static async createOrder({
    userId, goodArr = [], couponIds = [], addressId, paymentMethod,
  }) {
    return getManager().transaction(async (trx) => {
      const user = await User.findOneOrFail(decodeNumberId(userId));
      const goods = await Promise.all(
        goodArr.map(async ({ goodId, quantity }) => ({
          good: await Good.findOneOrFail(decodeNumberId(goodId)),
          quantity,
        })),
      );
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
        goodId: good.id,
        orderId: order.id,
        quantity,
      }));

      await trx.save(orderDetail);

      // 返回支付预信息
      return new WXPay()
        .setOrderNumber(orderNumber)
        .setTotalFee(totalFee)
        .preparePayment();
    });
  }

  static makeRecordNumber() {
    return `T${format(new Date(), 'YYYYMMDDHHmm')}${Math.floor(Math.random() * 1000000)}`;
  }
}
