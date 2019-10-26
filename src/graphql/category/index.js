import CategorySchema from './Category.graphql';
import { CategoryStatus } from '../../helper/status';
import CategoryResolver from './category';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    categorys(_, { query = {} }) {
      return CategoryResolver.searchCategories(query);
    },
    category(_, { query = {} }) {
      return CategoryResolver.searchCategory(query);
    },
  },
  Category: {
    ...idResolver('category'),
    shopIndex(v) {
      return v.shopCategory ? v.shopCategory.index : null;
    },
  },
  CategoryStatus,
  CategoryResult: {
    ...idResolver('category'),
    status: () => true,
  },
  Mutation: {
    createCategory(_, { category }) {
      return CategoryResolver.createCategory(category);
    },
    deleteCategory(_, { category }) {
      return CategoryResolver.deleteCategory(category);
    },
    updateCategory(_, { category }) {
      return CategoryResolver.updateCategory(category);
    },
  },
};

export const category = {
  resolvers,
  typeDef: CategorySchema,
};
