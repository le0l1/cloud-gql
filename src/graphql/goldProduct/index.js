import GoldProductSchema from './GoldProduct.graphql';
import GoldProductResolver from './goldProduct';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    goldProducts(_, { query = {} }) {
      return GoldProductResolver.searchGoldProducts(query);
    },
    goldProduct(_, { id }) {
      return GoldProductResolver.searchGoldProduct(id);
    },
  },
  Mutation: {
    createGoldProduct(_, { input }) {
      return GoldProductResolver.createGoldProduct(input);
    },
    updateGoldProduct(_, { input }) {
      return GoldProductResolver.updateGoldProduct(input);
    },
    deleteGoldProduct(_, { id }) {
      return GoldProductResolver.deleteGoldProduct(id);
    },
  },
  GoldProduct: idResolver('goldProduct'),
  GoldProductNode: idResolver('goldProduct'),
  GoldProductConnection: {
    edges(result) {
      return result[0];
    },
    pageInfo(v) {
      return v;
    },
  },
};

export default {
  typeDef: GoldProductSchema,
  resolvers,
};
