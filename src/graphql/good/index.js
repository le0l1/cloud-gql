import GoodSchema from './Good.graphql';
import { Good } from './good.entity';
import { formateID } from '../../helper/util';
import { GoodStatus } from '../../helper/status';
import GoodResolver from './good';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Mutation: {
    createGood(_, { createGoodInput }) {
      return GoodResolver.createGoods(createGoodInput);
    },
    updateGood(_, { updateGoodInput }) {
      return GoodResolver.updateGood(updateGoodInput);
    },
    deleteGood(_, { deleteGoodInput }) {
      return GoodResolver.deleteGood(deleteGoodInput);
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
  GoodActionResult: idResolver('good'),
  Query: {
    good(_, { query = {} }) {
      return GoodResolver.searchGood(query);
    },
    goods(_, { query = {} }) {
      return GoodResolver.searchGoods(query);
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
  GoodStatus,
};
export const good = {
  typeDef: GoodSchema,
  resolvers,
};
