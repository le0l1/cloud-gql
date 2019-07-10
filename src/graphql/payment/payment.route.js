import Router from 'koa-router';
import { js2xml } from 'xml-js';
import { getManager } from 'typeorm';
import { Transfer } from '../transfer/transfer.entity';
import { Payment } from './payment.entity';
import { mapObjectArr, env } from '../../helper/util';
import { User } from '../user/user.entity';
import { PaymentStatus } from '../../helper/status';
import { UnmatchedAmountError } from '../../helper/error';
import logger from '../../helper/logger';
import { WXPay } from './wxpay';

const router = new Router();

const failPaid = async (transferRecord) => {
  const { payment } = transferRecord;
  payment.paymentStatus = PaymentStatus.PAY_FAIL;
  return Payment.save(payment);
};

const checkReqStatus = body => !body.return_msg === 'SUCCESS' || !body.return_code === 'OK';
const checkTransferStatus = paymentStatus => paymentStatus === PaymentStatus.PAID;

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
  env('WXPAY_NOTIFY_URL'),
  async (ctx, next) => {
    ctx.type = 'application/xml';
    const xml = mapObjectArr(ctx.request.body.xml);
    if (checkReqStatus(xml)) {
      ctx.body = failResult;
      return;
    }
    const { sign, ...rest } = xml;
    const wxpay = new WXPay(rest);
    if (wxpay.sign !== sign) {
      logger.error('微信签名校验失败!');
      ctx.body = failResult;
      return;
    }
    await getManager().transaction(async (transactionManager) => {
      const transferRecord = await transactionManager
        .getRepository(Transfer)
        .createQueryBuilder('transfer')
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
        throw new UnmatchedAmountError();
      }

      const { payment, payee } = transferRecord;
      const merchant = await transactionManager
        .getRepository(User)
        .createQueryBuilder('user')
        .where('user.id = :id', {
          id: payee.belongto,
        })
        .setLock('optimistic')
        .getOne();
      payment.paymentStatus = PaymentStatus.PAID;
      merchant.totalFee = Number(payment.totalFee) + Number(merchant.totalFee);
      await transactionManager.getRepository(Payment).save(payment);
      await transactionManager.getRepository(User).save(merchant);
      return next();
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
