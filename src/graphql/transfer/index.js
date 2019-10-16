import TransferSchema from 'Transfer.graphql';
import TransferResolver from './transfer';
import { connectionResolver, idResolver } from '../../helper/resolver';
import { mergeIfValid } from '../../helper/util';

const resolvers = {
  Mutation: {
    createTransfer(_, { createTransferInput }) {
      return TransferResolver.createTransfer(createTransferInput);
    },
  },
  Query: {
    transfers(_, { transfersQuery }) {
      return TransferResolver.getTransfers(transfersQuery);
    },
    myTransfers(_, { query = {} }, { currentUser }) {
      return TransferResolver.getTransfersByUser(currentUser, query);
    },
  },
  TransferConnection: connectionResolver,
  Transfer: mergeIfValid(idResolver('transfer'), {}),
};
export default {
  typeDef: TransferSchema,
  resolvers,
};
