import OrderSchema from "order.graphql";
import { WXPay } from '../payment/wxpay'

const resolvers = {
  Mutation: {
    payOrder() {
      return new WXPay().preparePayment();
    }
  }
}

export  const order = {
  typeDef: OrderSchema,
  resolvers
}
