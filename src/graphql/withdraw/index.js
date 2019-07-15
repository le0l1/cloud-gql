import WithdrawSchema from './Withdraw.graphql';
import WithdrawResolver from './withdraw';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    withdraws(_, { query }) {
      return WithdrawResolver.searchWithdraws(query);
    },
    withdraw(_, { id }) {
      return WithdrawResolver.searchWithdraw(id);
    },
  },
  Mutation: {
    createWithdraw(_, { input }) {
      return WithdrawResolver.createWithdraw(input);
    },
    updateWithdraw(_, { input }) {
      return WithdrawResolver.updateWithdraw(input);
    },
  },
  Withdraw: idResolver('withdraw'),
  WithdrawConnection: {
    edges(result) {
      return result[0];
    },
    pageInfo(v) {
      return v;
    },
  },
};

export default {
  typeDef: WithdrawSchema,
  resolvers,
};
