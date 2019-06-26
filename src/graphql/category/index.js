import CategorySchema from './Category.graphql';
import { formateID, decodeNumberId } from '../../helper/util';
import { Category } from './category.entity';

const resolvers = {
  Query: {
    categorys(_, { query = {} }) {
      return Category.searchCategorys(query);
    },
    category(_, { query = {} }) {
      return Category.findOneOrFail(decodeNumberId(query.id));
    },
  },
  Category: {
    id(v) {
      return formateID('category', v.id);
    },
  },
  CategoryStatus: {
    HOT: 1,
    NORMAL: 2,
  },
  CategoryResult: {
    id(v) {
      return formateID('category', v.id);
    },
  },
  Mutation: {
    createCategory(_, { category }) {
      return Category.createCategory(category);
    },
    deleteCategory(_, { category }) {
      return Category.deleteCategory(category);
    },
    updateCategory(_, { category }) {
      return Category.updateCategory(category);
    },
  },
};

export const category = {
  resolvers,
  typeDef: CategorySchema,
};
