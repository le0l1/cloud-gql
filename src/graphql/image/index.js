import ImageSchema from './Image.gql';
import ImageResolver from './image';

const resolvers = {
  Query: {
    images(_, { query }) {
      return ImageResolver.searchImages(query);
    },
  },
};

export const image = {
  typeDef: ImageSchema,
  resolvers,
};
