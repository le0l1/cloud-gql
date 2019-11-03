import StatisticsSchema from './Statistics.graphql';
import { handleStatisticsSearch } from './statistics';

const resolvers = {
  Query: {
    statistics(_, { query = {} }) {
      return handleStatisticsSearch(query);
    },
  },
  Statistics: {
    userCount(v) {
      return v ? v.userCount : 0;
    },
    phoneCount(v) {
      return v ? v.phoneCount : 0;
    },
    orderCount(v) {
      return v ? v.orderCount : 0;
    },
    moneyCount(v) {
      return v ? v.moneyCount : 0;
    },
  },
};

export default {
  typeDef: StatisticsSchema,
  resolvers,
};
