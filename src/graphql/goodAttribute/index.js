import GoodAttributeSchema  from "./GoodAttribute.gql";
import { GoodAttribute } from "./goodAttribute.entity";

const resolvers = {
  Mutation: {
    // createGoodAttribute(_, { createGoodAttributeInput }) {
    //   return GoodAttribute.createAttribute(createGoodAttributeInput);
    // }
  }
}

export const goodAttribute = {
  typeDef: GoodAttributeSchema,
  resolvers
}