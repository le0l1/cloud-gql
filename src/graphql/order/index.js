import OrderSchema from 'order.graphql';
import OrderResolver from './order';

const resolvers = {
  Mutation: {
    createOrder(_, { createOrderInput }) {
      return OrderResolver.createOrder(createOrderInput);
    },
  },
};

export default {
  typeDef: OrderSchema,
  resolvers,
};
