import PaymentSchema from 'Payment.graphql';
import { PaymentStatus } from '../../helper/status';

const resolvers = {
  PaymentStatus,
  PAYMENTMETHOD: {
    // 支付宝
    ALIPAY: 1,
    // 微信
    WXPAY: 2,
  },
};

export const payment = {
  typeDef: PaymentSchema,
  resolvers,
};
