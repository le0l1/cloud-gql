import Router from 'koa-router';
import { js2xml } from 'xml-js';
import { getManager, TransactionManager } from 'typeorm';
import { Transfer } from '../transfer/transfer.entity';
import { Payment } from './payment.entity';
import { PAY_FAIL, PAID } from './payment';
import { mapObjectArr } from '../../helper/util';
import { User } from '../user/user.entity';

const router = new Router();

const failPaid = async (transferRecord) => {
  const { payment } = transferRecord;
  payment.paymentStatus = PAY_FAIL;
  return Payment.save(payment);
};

const checkReqStatus = body => !body.return_msg === 'SUCCESS' || !body.return_code === 'OK';
const checkTransferStatus = paymentStatus => paymentStatus === PAID;

router.post(
  '/pay',
  async (ctx, next) => {
    const xml = mapObjectArr(ctx.request.body.xml);
    if (checkReqStatus(xml)) {
      return false;
    }
    await getManager().transaction(async (transactionManager) => {
      const transferRecord = await transactionManager
        .getRepository(Transfer)
        .createQueryBuilder('transfer')
        .setLock('pessimistic_read')
        .innerJoinAndSelect('transfer.payment', 'payment')
        .innerJoinAndSelect('transfer.payee', 'payee')
        .where({
          recordNumber: xml.out_trade_no,
        })
        .getOne();

      if (checkTransferStatus(transferRecord.payment.paymentStatus)) {
        return next();
      }
      if (transferRecord.payment.totalFee !== xml.total_fee) {
        failPaid(transferRecord);
        ctx.body = {
          error: '支付失败',
        };
        return ctx;
      }

      const { payment, payee } = transferRecord;
      payment.paymentStatus = PAID;
      payee.totalFee += payment.totalFee;
      await transactionManager.getRepository(Payment).save(payment);
      await transactionManager.getRepository(User).save(payee);
      next();
    });
    // TODO: 支付成功后更新交易状态
  },
  async (ctx) => {
    ctx.body = js2xml(
      {
        xml: {
          return_msg: 'OK',
          return_code: 'SUCCESS',
        },
      },
      { compact: true, ignoreComment: true, spaces: 4 },
    );
  },
);

export default router;
