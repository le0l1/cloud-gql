import BusinessCircleSchema from './BusinessCircle.gql';
import { formateID } from '../../helper/util';
import { BusinessCircle } from './businessCircle.entity';
import { ReportStatus } from '../../helper/status';

const resolvers = {
  Query: {
    businessCircles(_, { query = {} }) {
      return BusinessCircle.searchBusinessCircle(query);
    },
  },
  Mutation: {
    createBusinessCircle(_, { createBusinessCircleInput }) {
      return BusinessCircle.createBusinessCircle(createBusinessCircleInput);
    },
  },
  ReportStatus,
  BusinessCircleOperationResult: {
    id(v) {
      return v.id ? formateID('businessCircle', v.id) : null;
    },
  },
  BusinessCircle: {
    id(v) {
      return v.id ? formateID('businessCircle', v.id) : null;
    },
    images(v) {
      return v.images ? v.images.map(a => a.path) : [];
    },
  },
  BusinessCircleConnection: {
    edges(v) {
      return v[0];
    },
    pageInfo(v) {
      return v;
    },
  },
};

export const businessCircle = {
  typeDef: BusinessCircleSchema,
  resolvers,
};
