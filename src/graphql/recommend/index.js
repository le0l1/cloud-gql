import RecommendSchema from "./Recommend.graphql";
import { Recommend } from "./recommend.entity";
import { pipe } from '../../helper/database/sql'
import { prop } from '../../helper/util'
import { formateID } from '../../helper/id'

const formateRecommendId = pipe(
  prop('key'),
  formateID.bind(null, 'recommend')
)

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
    // updateRecommend(_, { updateRecommendInput }) {
    //   return Recommend.updateRecommend(updateRecommendInput);
    // },
    deleteRecommend(_, { deleteRecommendInput }) {
      return Recommend.deleteRecommend(deleteRecommendInput);
    }
  },
  Recommend: {
    id: formateRecommendId
  }
};

export const recommend = {
  typeDef: RecommendSchema,
  resolvers
};
