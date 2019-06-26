import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { format } from 'date-fns';
import { User } from '../user/user.entity';
import { decodeNumberId } from '../../helper/util';
import { Payment } from '../payment/payment.entity';
import { WXPay } from '../payment/wxpay';
import { Shop } from '../shop/shop.entity';

@Entity()
export class Transfer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: 'character varying',
    comment: '交易号',
    name: 'record_number',
  })
  recordNumber;

  @ManyToOne(type => User, user => user.transfer)
  payer;

  @ManyToOne(type => User, user => user.receipt)
  payee;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  remark;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt;

  @OneToOne(type => Payment)
  @JoinColumn()
  payment;

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
      const recordNumber = Transfer.makeTransitionRecordNumber();
      const payerUser = await User.findOneOrFail(decodeNumberId(payer));
      const shop = await Shop.createQueryBuilder('shop')
        .leftJoinAndMapOne('shop.user', User, 'user', 'user.id = shop.belongto')
        .andWhere('shop.id = :payee', { payee: decodeNumberId(payee) })
        .getOne();
      if (!shop) throw new Error('shop not exits');
      const payment = await Payment.create({
        totalFee,
        paymentMethod,
      }).save();
      await Transfer.create({
        remark,
        payment,
        recordNumber,
        payer: payerUser,
        payee: shop.user,
      }).save();
      return new WXPay()
        .setOrderNumber(recordNumber)
        .setTotalFee(totalFee)
        .preparePayment()
        .then(res => res);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 生成交易记录号
   * @returns {string}
   */
  static makeTransitionRecordNumber() {
    return `T${format(new Date(), 'YYYYMMDDHHmm')}${Math.floor(Math.random() * 1000000)}`;
  }
}
