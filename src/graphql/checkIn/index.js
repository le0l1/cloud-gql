import CheckInSchema from './CheckIn.graphql';
import CheckInResolver from './checkIn';

const resolvers = {
  Mutation: {
    checkIn(_, { userId }) {
      return CheckInResolver.checkIn(userId);
    },
  },
};

export default {
  typeDef: CheckInSchema,
  resolvers,
};
