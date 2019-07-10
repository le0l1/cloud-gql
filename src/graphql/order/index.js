import OrderSchema from 'order.graphql';
import OrderResolver from './order';
import { idResolver } from '../../helper/resolver';
import { OrderStatus } from '../../helper/status';

const resolvers = {
  Mutation: {
    createOrder(_, { createOrderInput }) {
      return OrderResolver.createOrder(createOrderInput);
    },
    updateOrder(_, { updateOrderInput }) {
      return OrderResolver.updateOrder(updateOrderInput);
    },
    deleteOrder(_, { id }) {
      return OrderResolver.deleteOrder(id);
    },
  },
  Query: {
    orders(_, { query }) {
      return OrderResolver.searchOrders(query);
    },
    order(_, { id }) {
      return OrderResolver.searchOrder(id);
    },
  },
  Order: idResolver('order'),
  OrderStatus,
  OrderActionResult: {
    ...idResolver('order'),
    status: () => true,
  },
};

export default {
  typeDef: OrderSchema,
  resolvers,
};
