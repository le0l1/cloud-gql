import OrderSchema from 'order.graphql';
import OrderResolver from './order';
import { idResolver } from '../../helper/resolver';
import { OrderStatus } from '../../helper/status';
import { formateID } from '../../helper/util';

const resolvers = {
  Mutation: {
    createOrder(_, { createOrderInput }) {
      return OrderResolver.createOrder(createOrderInput);
    },
    payOrder(_, { payOrderInput }) {
      return OrderResolver.payOrder(payOrderInput);
    },
    updateOrder(_, { updateOrderInput }) {
      return OrderResolver.updateOrder(updateOrderInput);
    },
    deleteOrder(_, { id }) {
      return OrderResolver.deleteOrder(id);
    },
    refundOrder(_, { id }) {
      return OrderResolver.refundOrder(id);
    },
  },
  Query: {
    orders(_, { query }) {
      return OrderResolver.searchOrders(query);
    },
    order(_, { id }) {
      return OrderResolver.searchOrder(id);
    },
    orderLog(_, { query }) {
      return OrderResolver.searchOrderLog(query);
    },
  },
  Order: idResolver('order'),
  OrderConnection: {
    edges(result) {
      return result[0];
    },
    pageInfo(v) {
      return v;
    },
  },
  OrderStatus,
  OrderDetail: {
    // shopId(v) {
    //   return v ? formateID('shop', v.shopId) : null;
    // },
    goodId(v) {
      return v ? formateID('good', v.goodId) : null;
    },
  },
  OrderActionResult: {
    ...idResolver('order'),
    status: () => true,
  },
};

export default {
  typeDef: OrderSchema,
  resolvers,
};
