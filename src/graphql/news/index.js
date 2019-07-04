import NewsResolver from './news';
import NewsSchema from './News.graphql';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    news(_, { query }) {
      return NewsResolver.searchNews(query);
    },
  },
  Mutation: {
    createNews(_, { createNewsInput }) {
      return NewsResolver.createNews(createNewsInput);
    },
    updateNews(_, { updateNewsInput }) {
      return NewsResolver.updateNews(updateNewsInput);
    },
    deleteNews(_, { deleteNewsInput }) {
      return NewsResolver.deleteNews(deleteNewsInput);
    },
  },
  News: idResolver('news'),
  NewsConnection: {
    pageInfo: v => v,
    edges: v => v[0],
  },
  NewsActionResult: {
    ...idResolver('news'),
    status: () => true,
  },
};

export default {
  typeDef: NewsSchema,
  resolvers,
};
