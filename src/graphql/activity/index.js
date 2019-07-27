import ActivitySchema from './Activity.graphql';
import ActivityResolver from './activity';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Mutation: {
    createActivity(_, { input }) {
      return ActivityResolver.createActivity(input);
    },
    updateActivity(_, { input }) {
      return ActivityResolver.updateActivity(input);
    },
    addActivityProduct(_, { input }) {
      return ActivityResolver.addActivityProduct(input);
    },
    deleteActivityProduct(_, { id }) {
      return ActivityResolver.deleteActivityProduct(id);
    },
    luckDraw(_, { input }) {
      return ActivityResolver.luckDraw(input);
    },
  },
  Query: {
    activity(_, { id }) {
      return ActivityResolver.searchActivity(id);
    },
  },
  Activity: {
    ...idResolver('activity'),
    endAt(v) {
      return v.endAt.toString();
    },
  },
  ActivityProduct: idResolver('activityItem'),
  ActivityDetail: {
    ...idResolver('activity'),
    endAt(v) {
      return v.endAt.toString();
    },
  },
};

export default {
  typeDef: ActivitySchema,
  resolvers,
};
