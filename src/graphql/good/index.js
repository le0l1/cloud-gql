import GoodSchema from "./Good.gql";
import { Good } from "./good.entity";

const resolvers =  {
  Mutation: {
    createGood(_, { createGoodInput }) {
      return Good.createGood(createGoodInput)
    }
  }
}
export const good = {
  typeDef: GoodSchema,
  resolvers
};
