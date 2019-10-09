import { getManager } from 'typeorm';
import { format } from 'date-fns';
import { User } from '../user/user.entity';
import { decodeNumberId, env } from '../../helper/util';
import { RedPacket } from './redPacket.entity';
import { RedPacketEmptyError, RedPacketGrabedError, RedPacketFailError } from '../../helper/error';
import { RedPacketRecord } from './redPacketRecord.entity';
import logger from '../../helper/logger';
import AliPay from '../payment/alipay';
import { Payment } from '../payment/payment.entity';
import { PaymentStatus } from '../../helper/status';
import { Shop } from '../shop/shop.entity';

export default class RedPacketResolver {
  /**
   * 发送红包
   */
  static sendRedPacket(user, {
    quantity, totalFee, description,
  }) {
    return getManager().transaction(async (trx) => {
      const orderNumber = `R${format(new Date(), 'YYYYMMDDHHmm')}${Math.floor(
        Math.random() * 1000000,
      )}`;
      const payment = await trx.save(Payment, {
        paymentMethod: '1',
        totalFee,
      });

      await trx.save(RedPacket, {
        sponsor: user.id,
        description,
        quantity,
        totalFee,
        orderNumber,
        paymentId: payment.id,
        restQuantity: quantity,
      });

      return new AliPay()
        .setOrderNumber(orderNumber)
        .setNotifyUrl(env('HOST') + env('REDPACKET_NOTIFY_URL'))
        .setSubject('红包商品')
        .setTotalFee(0.01)
        .pagePay();
    });
  }

  /**
   * 抢红包
   */
  static async grabRedPacket(user, { redPacketId }) {
    const redPacket = await RedPacket.findOneOrFail({
      id: decodeNumberId(redPacketId),
      lock: { mode: 'optimistic' },
    });
    if (redPacket.restQuantity === 0) {
      throw new RedPacketEmptyError();
    }
    if (
      await RedPacketRecord.findOne({
        userId: user.id,
        redPacketId: redPacket.id,
      })
    ) {
      throw new RedPacketGrabedError();
    }

    return RedPacketResolver.doGrab(redPacket, user);
  }

  /**
   * 执行抢红包操作 （CAS）
   * @param {*} redPacket 红包
   * @param {*} user 用户
   */
  static doGrab(redPacket, user) {
    return getManager().transaction(async (trx) => {
      logger.info('开始抢红包!');
      const retry = async (time = 1) => {
        try {
          const { version: oldVersion } = redPacket;
          await trx
            .merge(RedPacket, redPacket, {
              restQuantity: redPacket.restQuantity - 1,
            })
            .save();
          if (redPacket.version !== oldVersion + 1) {
            throw new Error(`红包信息不一致! 重试第${time}次`);
          }
          const grabMoney = redPacket.totalFee / redPacket.quantity;
          await trx.save(RedPacketRecord, {
            userId: user.id,
            redPacketId: redPacket.id,
            totalFee: grabMoney,
          });
          // await trx.update(User, user, { totalFee: () => `total_fee + ${grabMoney}` });
          logger.info(`抢到红包啦! 金额: ${grabMoney}`);
          return grabMoney;
        } catch (e) {
          logger.info(e);
          if (time > 3) {
            throw new RedPacketFailError();
          }
          return retry(time + 1);
        }
      };
      return retry();
    });
  }

  /**
   * 查询红包详情
   */
  static searchRedPacket(id) {
    return RedPacket.createQueryBuilder('redPacket')
      .leftJoinAndMapOne(
        'redPacket.shop',
        Shop,
        'shop',
        'shop.user_id = redPacket.sponsor',
      )
      .where('redPacket.id = :id', { id: decodeNumberId(id) })
      .getOne();
  }

  static searchRedPackets() {
    return RedPacket.createQueryBuilder('redPacket')
      .leftJoinAndMapOne(
        'redPacket.payment',
        Payment,
        'payment',
        'redPacket.paymentId = payment.id',
      )
      .leftJoinAndMapOne(
        'redPacket.shop',
        Shop,
        'shop',
        'shop.user_id = redPacket.sponsor',
      )
      .where('payment.paymentStatus = :status', {
        status: PaymentStatus.PAID,
      })
      .getMany();
  }
}
