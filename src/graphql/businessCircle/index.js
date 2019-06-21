import BusinessCircleSchema from "./BusinessCircle.gql";
import { formateID } from "../../helper/id";
import { BusinessCircle } from "./businessCircle.entity";

const resolvers = {
  Query: {
    businessCircles(_, { query = {}}) {
      return BusinessCircle.searchBusinessCircle(query)
    }
  },
  Mutation: {
    createBusinessCircle(_, { createBusinessCircleInput }) {
      return BusinessCircle.createBusinessCircle(createBusinessCircleInput);
    }
  },
  REPORTSTATUS: {
    IS_NOT_REPORT: 1,
    IS_REPORTED: 2,
  },
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
      return v.images ? v.images.map(a => a.path) : []
    }
  },
  BusinessCircleConnection: {
    edges(v) {
      return v[0];
    },
    pageInfo(v) {
      return v;
    }
  }
}

export const businessCircle = {
  typeDef: BusinessCircleSchema,
  resolvers
};
