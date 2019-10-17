import { format } from 'date-fns';
import { getManager } from 'typeorm';
import { Shop } from '../shop/shop.entity';
import { decodeNumberId } from '../../helper/util';
import { Transfer } from './transfer.entity';
import { User } from '../user/user.entity';
import { Payment } from '../payment/payment.entity';
import { createPay } from '../payment/pay';
import { PaymentOrder } from '../../payment/paymentOrder.entity';
import { PaymentOrderType } from '../../helper/status';

export default class TransferResolver {
  /**
   * 创建交易记录
   * @param payer 付款方
   * @param payee 收款方(商户)
   * @param totalFee  金额
   * @param paymentMethod 支付方式
   * @param remark 备注
   * @returns {Promise<any | never>}
   */
  static async createTransfer({
    payer,
    payee,
    totalFee,
    paymentMethod,
    remark,
  }) {
    return getManager().transaction(async (trx) => {
      const recordNumber = TransferResolver.makeTransitionRecordNumber();
      const payerUser = await User.findOneOrFail(decodeNumberId(payer));
      const shop = await Shop.findOneOrFail(decodeNumberId(payee));
      const payment = await trx.save(Payment.create({
        totalFee,
        paymentMethod,
      }));
      const transfer = await trx.save(Transfer.create({
        remark,
        recordNumber,
        payment,
        payer: payerUser,
        payee: shop,
      }));
      await trx.save(PaymentOrder.create({
        orderNumber: transfer.recordNumber,
        orderType: PaymentOrderType.transfer,
        orderTypeId: transfer.id,
        paymentId: payment.id,
      }));
      return createPay(paymentMethod)
        .setOrderNumber(recordNumber)
        .setTotalFee(totalFee)
        .preparePayment();
    });
  }

  /**
   * 生成交易记录号
   * @returns {string}
   */
  static makeTransitionRecordNumber() {
    return `S${format(new Date(), 'YYYYMMDDHHmm')}${Math.floor(
      Math.random() * 1000000,
    )}`;
  }

  /**
   * 获取交易记录
   * @param offset 偏移量
   * @param limit 单次数量
   */
  static getTransfers({ offset = 1, limit = 8 }) {
    return Transfer.findAndCount({
      skip: Math.max(0, offset - 1),
      take: limit,
      relations: ['payee', 'payer', 'payment'],
    });
  }

  // 我的交易记录
  static getTransfersByUser(user, { offset = 1, limit = 8 }) {
    return Transfer.findAndCount({
      skip: Math.max(0, offset - 1),
      take: limit,
      relations: ['payee', 'payer', 'payment'],
      where: {
        payer: user,
      },
    });
  }
}
