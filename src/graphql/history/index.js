import HistorySchema from './History.graphql';
import HistoryResolver from './history';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    historys(_, { query = {} }) {
      return HistoryResolver.searchHisotrys(query);
    },
  },
  Mutation: {
    createHistory(_, { createHistoryInput }) {
      return HistoryResolver.createHistory(createHistoryInput);
    },
    deleteHistory(_, { id }) {
      return HistoryResolver.delteHistory(id);
    },
  },
  History: idResolver('history'),
  HistoryConnection: {
    edges(result) {
      return result[0];
    },
    pageInfo(v) {
      return v;
    },
  },
  HistoryActionResult: {
    ...idResolver('history'),
    status: () => true,
  },
};

export default {
  typeDef: HistorySchema,
  resolvers,
};
