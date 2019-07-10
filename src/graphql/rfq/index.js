import RFQSchema from './RFQ.gql';
import { idResolver } from '../../helper/resolver';
import RFQResolver from './RFQ';

const resolvers = {
  Query: {
    RFQ(_, { query = {} }) {
      return RFQResolver.searchRFQs(query);
    },
  },
  Mutation: {
    createRFQ(_, { createRFQInput }) {
      return RFQResolver.createRFQ(createRFQInput);
    },
    deleteRFQ(_, { deleteRFQInput }) {
      return RFQResolver.deleteRFQ(deleteRFQInput);
    },
  },
  RFQ: idResolver('rfq'),
  RFQActionResult: {
    ...idResolver('rfq'),
    status: () => true,
  },
  RFQConnection: {
    edges(v) {
      return v[0];
    },
    pageInfo(v) {
      return v;
    },
  },
};

export const rfq = {
  typeDef: RFQSchema,
  resolvers,
};
