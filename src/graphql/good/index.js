import GoodSchema from './Good.gql';
import { Good } from './good.entity';
import { formateID } from '../../helper/util';
import { GooDStatus } from '../../helper/status';

const resolvers = {
  Mutation: {
    createGood(_, { createGoodInput }) {
      return Good.createGood(createGoodInput);
    },
    updateGood(_, { updateGoodInput }) {
      return Good.updateGood(updateGoodInput);
    },
    deleteGood(_, { deleteGoodInput }) {
      return Good.deleteGood(deleteGoodInput);
    },
  },
  Good: {
    id(v) {
      return v.id ? formateID('good', v.id) : null;
    },
    shopId(v) {
      return v.shopId ? formateID('shop', v.shopId) : null;
    },
  },
  Query: {
    good(_, { query = {} }) {
      return Good.searchGood(query);
    },
    goods(_, { query = {} }) {
      return Good.searchGoodConnection(query);
    },
  },
  GoodConnection: {
    edges(v) {
      return v[0];
    },
    pageInfo(v) {
      return v;
    },
  },
  GooDStatus,
};
export const good = {
  typeDef: GoodSchema,
  resolvers,
};
