import CartSchema from './Cart.graphql';
import CartResolver from './cart';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    carts(_, { cartsQuery }) {
      return CartResolver.getCarts(cartsQuery);
    },
  },
  Mutation: {
    createCart(_, { createCartInput }) {
      return CartResolver.createCart(createCartInput);
    },
    updateCart(_, { updateCartInput }) {
      return CartResolver.updateCart(updateCartInput);
    },
    deleteCart(_, { deleteCartInput }) {
      return CartResolver.deleteCart(deleteCartInput);
    },
  },
  CartActionResult: {
    ...idResolver('cart'),
    status: () => true,
  },
  Cart: idResolver('cart'),
};

export default {
  typeDef: CartSchema,
  resolvers,
};
