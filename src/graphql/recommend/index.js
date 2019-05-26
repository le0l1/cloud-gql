import RecommendSchema from "./Recommend.gql";
import { Recommend } from "./recommend.entity";

const resolvers = {
  Query: {
    recommends(_, { searchRecommendInput }) {
      return Recommend.searchRecommend(searchRecommendInput);
    }
  },
  RecommendConnection: {
    edges(v) {
      return v[0];
    },
    pageInfo(v) {
      return v[1];
    }
  },
  Mutation: {
    createRecommend(_, { createRecommendInput }) {
      return Recommend.createRecommend(createRecommendInput);
    },
    updateRecommend(_, { updateRecommendInput }) {
      return Recommend.updateRecommend(updateRecommendInput);
    },
    deleteRecommend(_, { deleteRecommendInput }) {
      return Recommend.deleteRecommend(deleteRecommendInput);
    }
  },
  RecommendType: {
    SHOP: 1,
    GOOD: 2
  }
};

export const recommend = {
  typeDef: RecommendSchema,
  resolvers
};
