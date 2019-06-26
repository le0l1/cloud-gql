import PaymentSchema from 'Payment.graphql';
import { PaymentStatus } from '../../helper/status';
import { mergeIfValid } from '../../helper/util';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  PaymentStatus,
  PAYMENTMETHOD: {
    // 支付宝
    ALIPAY: 1,
    // 微信
    WXPAY: 2,
  },
  Payment: mergeIfValid(idResolver('payment'), {}),
};

export default {
  typeDef: PaymentSchema,
  resolvers,
};
