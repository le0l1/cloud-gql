import SkuSchema from './Sku.gql';
import { Sku } from './sku.entity';
import { formateID } from '../../helper/util';

const resolvers = {
  Mutation: {
    createSku(_, { createSkuInput }) {
      return Sku.createSku(createSkuInput);
    },
  },
  Query: {
    sku(_, { query }) {
      return Sku.searchSku(query);
    },
  },
  Sku: {
    id(v) {
      return v.id ? formateID(v.id) : null;
    },
  },
};

export const sku = {
  typeDef: SkuSchema,
  resolvers,
};
