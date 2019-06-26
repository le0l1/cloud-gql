import PaymentSchema from 'Payment.graphql';

// 已支付
export const PAID = 2;
// 支付中
export const PENDING = 3;
// 已取消
export const CANCELED = 10;
// 支付失败
export const PAY_FAIL = 20;

const resolvers = {
  PAYMENTSTATUS: {
    PAID,
    PENDING,
    CANCELED,
    PAY_FAIL,
  },
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
