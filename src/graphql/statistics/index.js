import StatisticsSchema from './Statistics.graphql';
import StatisticsResolver from './statistics';

const resolvers = {
  Query: {
    statistics(_, { query = {} }) {
      return StatisticsResolver.searchStatistics(query);
    },
  },
};

export default {
  typeDef: StatisticsSchema,
  resolvers,
};
