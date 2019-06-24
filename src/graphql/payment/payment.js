import PaymentSchema from "Payment.graphql";

const resolvers = {
  PAYMENTSTATUS: {
    // 已支付
    PAID: 2,
    // 支付中
    PENDING: 3,
    // 已取消
    CANCELED: 10,
    // 支付失败
    PAY_FAIL: 20
  },
  PAYMENTMETHOD: {
    // 支付宝
    ALIPAY: 1,
    // 微信
    WXPAY: 2
  }
};

export const payment = {
  typeDef: PaymentSchema,
  resolvers
};
