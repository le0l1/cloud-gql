import HotSchema from './Hot.graphql';
import HotResolver from './hot';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    hot(_, { route }) {
      return HotResolver.searchHot(route);
    },
  },
  Mutation: {
    createHot(_, { input }) {
      return HotResolver.storeHot(input);
    },
    updateHot(_, { input }) {
      return HotResolver.storeHot(input);
    },
  },
  Hot: idResolver('hot'),
};

export default {
  typeDef: HotSchema,
  resolvers,
};
