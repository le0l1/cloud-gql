import ImageSchema from './Image.gql';
import { Image } from './image.entity';

const resolvers = {
  Query: {
    images(_, { query }) {
      return Image.searchImages(query);
    },
  },
};

export const image = {
  typeDef: ImageSchema,
  resolvers,
};
