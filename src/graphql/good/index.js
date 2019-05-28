import GoodSchema from "./Good.gql";
import { Good } from "./good.entity";

const resolvers = {
  Mutation: {
    createGood(_, { createGoodInput }) {
      return Good.createGood(createGoodInput);
    },
    updateGood(_, { updateGoodInput}) {
      return Good.updateGood(updateGoodInput)
    },
    deleteGood(_, {deleteGoodInput}) {
      return Good.deleteGood(deleteGoodInput)
    }
  },
  Query: {
    good(_, { query = {} }) {
      return Good.searchGood(query)
    }
  },
  GOODSTATUS: {
    ONLINE: 1,
    OFFLINE: 2
  },
};
export const good = {
  typeDef: GoodSchema,
  resolvers
};
