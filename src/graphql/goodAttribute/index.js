import GoodAttributeSchema from "./GoodAttribute.gql";
import { GoodAttribute } from "./goodAttribute.entity";
import { formateID } from "../../helper/id";

const resolvers = {
  Mutation: {
    createGoodAttribute(_, { createGoodAttributeInput }) {
      return GoodAttribute.createAttribute(createGoodAttributeInput);
    }
  },
  Query: {
    goodAttribute(_, { query }) {
      return GoodAttribute.searchAttribute(query);
    }
  },
  AttributeSpec: {
    id(v) {
      return v.id ? formateID("attribute", v.id) : null;
    }
  }
};

export const goodAttribute = {
  typeDef: GoodAttributeSchema,
  resolvers
};
