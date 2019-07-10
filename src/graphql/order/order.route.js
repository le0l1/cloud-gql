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
    const { sign, ...rest } = xml;
    const wxpay = new WXPay(rest);
    if (wxpay.sign !== sign) {
      logger.error('微信签名校验失败!');
      ctx.body = failResult;
      return;
    }
    await getManager().transaction(async (trx) => {
      const order = await Order.createQueryBuilder('order')
        .leftJoinAndMapMany(
          'order.orderDetail',
          OrderDetail,
          'orderDetail',
          'orderDetail.orderId = order.id',
        )
        .getOne();

      logger.info('检查订单状态:', order.status);
      if (order.status !== OrderStatus.PENDING) {
        return next();
      }
      logger.info('当前订单号:', order.orderNumber);
      logger.info('订单总金额:', order.totalCount);
      logger.info('优惠金额:', order.discount);
      logger.info('微信支付金额(分)', xml.total_fee);

      if (Number(order.totalCount) - Number(order.discount) !== Number(xml.total_fee) / 1000) {
        logger.error('支付金额与订单金额不匹配!');
        ctx.body = failResult;
        return;
      }
      const cake = order.orderDetail.reduce(
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
      // TODO: 乐观锁 锁定用户版本
      await Promise.all(
        Object.keys(cake).map(async (c) => {
          const { belongto: user } = await Shop.findOne(c);
          logger.info(`向用户${user}打入余额  ${cake[c]} 元`);
          await trx
            .createQueryBuilder()
            .update(User)
            .set({
              totalFee: () => `total_fee + ${cake[c]}`,
            })
            .where('id = :id', { id: user.id })
            .execute();
        }),
      );
      logger.info(`修改支付记录 ${order.paymentId} 状态为已支付`);
      await trx
        .createQueryBuilder()
        .update(Payment)
        .set({
          paymentStatus: PaymentStatus.PAID,
        })
        .execute();
      logger.info(`修改订单 ${order.id} 状态为待发货`);
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
