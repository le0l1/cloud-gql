import RecommendSchema from "./Recommend.gql";
import { Recommend } from "./recommend.entity";

const resolvers = {
  Mutation: {
    createRecommend(_, { createRecommendInput }) {
      console.log(createRecommendInput);
      return Recommend.createRecommend(createRecommendInput);
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
