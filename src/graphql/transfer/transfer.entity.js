import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToOne
} from "typeorm";
import { User } from "../user/user.entity";
import { decodeNumberId } from "../../helper/id";
import { Payment } from "../payment/payment.entity";
import { WXPay } from "../payment/wxpay";
import { Shop } from "../shop/shop.entity";

@Entity()
export class Transfer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "character varying",
    comment: "交易号",
    name: "record_number"
  })
  recordNumber;

  @ManyToMany(type => User, user => user.transfer)
  payer;

  @ManyToMany(type => User, user => user.transfer)
  payee;

  @Column({
    type: "character varying",
    nullable: true
  })
  remark;

  @CreateDateColumn({
    type: "timestamp"
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
    payer,
    payee,
    totalFee,
    paymentMethod,
    remark
  }) {
    try {
      const recordNumber = Transfer.makeTransitionRecordNumber();
      const makeUser = id =>
        User.create({
          id: decodeNumberId(id)
        });
      const { belongto: payeeUser } = await Shop.findOne({
        id: decodeNumberId(payee)
      });

      await Transfer.create({
        recordNumber,
        payer: makeUser(payer),
        payee: payeeUser,
        payment: Payment.create({
          paymentMethod,
          totalFee
        }),
        remark
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
    return "T" + new Date() + Math.floor(Math.sort() * 1000);
  }
}
