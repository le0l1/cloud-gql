import { format } from 'date-fns';
import { WXPay } from '../payment/wxpay';
import { Shop } from '../shop/shop.entity';
import { decodeNumberId } from '../../helper/util';
import { Transfer } from './transfer.entity';
import { User } from '../user/user.entity';
import { Payment } from '../payment/payment.entity';

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
    payer, payee, totalFee, paymentMethod, remark,
  }) {
    try {
      const recordNumber = TransferResolver.makeTransitionRecordNumber();
      const payerUser = await User.findOneOrFail(decodeNumberId(payer));
      const shop = await Shop.findOneOrFail(decodeNumberId(payee));
      const payment = await Payment.create({
        totalFee,
        paymentMethod,
      }).save();
      await Transfer.create({
        remark,
        payment,
        recordNumber,
        payer: payerUser,
        payee: shop,
      }).save();
      return new WXPay()
        .setOrderNumber(recordNumber)
        .setTotalFee(totalFee)
        .preparePayment();
    } catch (e) {
      throw e;
    }
  }

  /**
   * 生成交易记录号
   * @returns {string}
   */
  static makeTransitionRecordNumber() {
    return `S${format(new Date(), 'YYYYMMDDHHmm')}${Math.floor(Math.random() * 1000000)}`;
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
}
