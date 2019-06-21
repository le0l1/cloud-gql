import RecommendSchema from "./Recommend.graphql";
import { Recommend } from "./recommend.entity";

const resolvers = {
  Query: {
    recommends(_, { searchRecommendInput }) {
      return Recommend.searchRecommend(searchRecommendInput);
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
};

export const recommend = {
  typeDef: RecommendSchema,
  resolvers
};
