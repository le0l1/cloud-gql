import RFQSchema from './RFQ.gql';
import { RFQ } from './RFQ.entity';
import { formateID } from '../../helper/util';

const resolvers = {
  Query: {
    RFQ(_, { query = {} }) {
      return RFQ.searchRFQ(query);
    },
  },
  Mutation: {
    createRFQ(_, { createRFQInput }) {
      return RFQ.createRFQ(createRFQInput);
    },
  },
  RFQ: {
    id(v) {
      return v.id ? formateID('RFQ', v.id) : null;
    },
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
