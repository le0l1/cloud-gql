import GoldOrderSchema from './GoldOrder.graphql';
import GoldOrderResolver from './goldOrder';
import { idResolver } from '../../helper/resolver';
import { formateID } from '../../helper/util';

const resolvers = {
  Query: {
    goldOrder(_, { id }) {
      return GoldOrderResolver.searchGoldOrder(id);
    },
    goldOrders(_, { input = {} }) {
      return GoldOrderResolver.searchGoldOrders(input);
    },
  },
  Mutation: {
    createGoldOrder(_, { input }) {
      return GoldOrderResolver.createGoldOrder(input);
    },
    updateGoldOrder(_, { input }) {
      return GoldOrderResolver.updateGoldOrder(input);
    },
    deleteGoldOrder(_, { id }) {
      return GoldOrderResolver.deleteGoldOrder(id);
    },
  },
  GoldOrderNode: {
    id(v) {
      return formateID('goldOrder', v.id);
    },
    userId(v) {
      return formateID('user', v.userId);
    },
    goldProductId(v) {
      return formateID('goldProduct', v.goldProductId);
    },
    addressId(v) {
      return formateID('address', v.addressId);
    },
  },
  GoldOrder: idResolver('goldOrder'),
  GoldOrderConnection: {
    edges(result) {
      return result[0];
    },
    pageInfo(v) {
      return v;
    },
  },
};

export default {
  typeDef: GoldOrderSchema,
  resolvers,
};
