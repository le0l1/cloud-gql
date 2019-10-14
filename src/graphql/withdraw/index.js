import WithdrawSchema from './Withdraw.graphql';
import WithdrawResolver from './withdraw';
import { idResolver } from '../../helper/resolver';
import { bindAccount, getBindAccount, cancelBindAccount } from './withdrawBank';
import { formateID } from '../../helper/util';

const resolvers = {
  Query: {
    withdraws(_, { query }) {
      return WithdrawResolver.searchWithdraws(query);
    },
    withdraw(_, { id }) {
      return WithdrawResolver.searchWithdraw(id);
    },
    withdrawBank(_, params, { currentUser }) {
      return getBindAccount(currentUser);
    },
  },
  Mutation: {
    createWithdraw(_, { input }) {
      return WithdrawResolver.createWithdraw(input);
    },
    updateWithdraw(_, { input }) {
      return WithdrawResolver.updateWithdraw(input);
    },
    bindWithdrawBank(_, { input }, { currentUser }) {
      return bindAccount(currentUser, input);
    },
    cancelWithdrawBank(_, { id }, { currentUser }) {
      return cancelBindAccount(currentUser, id);
    },
  },
  Withdraw: idResolver('withdraw'),
  WithdrawBank: {
    id(v) {
      return formateID('withdrawBank', v.id);
    },
    userId(v) {
      return formateID('user', v.userId);
    },
  },
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
