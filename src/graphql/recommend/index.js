import RecommendSchema from './Recommend.graphql';
import { Recommend } from './recommend.entity';
import { prop, formateID, pipe } from '../../helper/util';

const formateRecommendId = pipe(
  prop('id'),
  formateID.bind(null, 'recommend'),
);

const resolvers = {
  Query: {
    recommends(_, { searchRecommendInput }) {
      return Recommend.searchRecommend(searchRecommendInput);
    },
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
    },
  },
  Recommend: {
    id: formateRecommendId,
  },
  RecommendActionResult: {
    id: formateRecommendId,
  },
};

export const recommend = {
  typeDef: RecommendSchema,
  resolvers,
};
