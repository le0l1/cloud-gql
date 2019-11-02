import StatisticsSchema from './Statistics.graphql';
import { handleStatisticsSearch } from './statistics';

const resolvers = {
  Query: {
    statistics(_, { query = {} }) {
      return handleStatisticsSearch(query);
    },
  },
};

export default {
  typeDef: StatisticsSchema,
  resolvers,
};
