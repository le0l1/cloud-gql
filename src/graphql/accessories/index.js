import AccessoriesSchema from "./Accessories.gql";
import { Accessories } from "./accessories.entity";
import { formateID } from "../../helper/id";

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
  },
  Accessories: {
    id(v) {
      return v.id ? formateID("accessories", v.id) : null;
    }
  }
};

export const accessories = {
  typeDef: AccessoriesSchema,
  resolvers
};
