import AccessoriesSchema from './Accessories.gql';
import AccessoriesResolver from './accessories';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Mutation: {
    createAccessories(_, { createAccessoriesInput }) {
      return AccessoriesResolver.createAccessories(createAccessoriesInput);
    },
  },
  Query: {
    accessories(_, { query }) {
      return AccessoriesResolver.searchAccessories(query);
    },
  },
  Accessories: idResolver('accessories'),
  AccessoriesActionResult: {
    ...idResolver('accessories'),
    status: () => true,
  },
};

export const accessories = {
  typeDef: AccessoriesSchema,
  resolvers,
};
