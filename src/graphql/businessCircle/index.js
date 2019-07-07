import BusinessCircleSchema from './BusinessCircle.graphql';
import { formateID } from '../../helper/util';
import { ReportStatus } from '../../helper/status';
import BusinessCircleResolver from './businessCircle';

const resolvers = {
  Query: {
    businessCircles(_, { query = {} }) {
      return BusinessCircleResolver.searchBusinessCircles(query);
    },
  },
  Mutation: {
    createBusinessCircle(_, { createBusinessCircleInput }) {
      return BusinessCircleResolver.createBusinessCircle(createBusinessCircleInput);
    },
    deleteBusinessCircle(_, { deleteBusinessCircleInput }) {
      return BusinessCircleResolver.deleteBusinessCircles(deleteBusinessCircleInput);
    },
    starBusinessCircle(_, { starBusinessCircleInput }) {
      return BusinessCircleResolver.starBusinessCircle(starBusinessCircleInput);
    },
    reportBusinessCircle(_, { reportBusinessCircleInput }) {
      return BusinessCircleResolver.reportBusinessCircle(reportBusinessCircleInput);
    }
  },
  ReportStatus,
  BusinessCircleOperationResult: {
    id(v) {
      return v.id ? formateID('businessCircle', v.id) : null;
    },
    status: () => true,
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
