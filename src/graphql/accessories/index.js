import AccessoriesSchema from "./Accessories.gql";
import { Accessories } from "./accessories.entity";

const resolvers = {
  Mutation: {
    createAccessories(_, { createAccessoriesInput }) {
      return Accessories.createAccessories(createAccessoriesInput);
    }
  },
  Query: {
    accessories(_, { query }) {
      return Accessories.searchAccessories(query);
    }
  }
};

export const accessories = {
  typeDef: AccessoriesSchema,
  resolvers
};
