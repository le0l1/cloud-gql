import CategorySchema from "./Category.graphql";
import { createCategoryModel } from "./category";
import { db } from "../../helper/database/db";
import { formateID } from "../../helper/id";
import { Category } from "./category.entity";

const resolvers = {
  Query: {
    categorys(_, { query = {} }) {
      return Category.searchCategorys(query);
    },
    category(_, { query = {} }) {
      const categoryModel = createCategoryModel(db);
      return categoryModel.searchCategory(query);
    }
  },
  Category: {
    id(v) {
      return formateID("category", v.id);
    }
  },
  CategoryStatus: {
    HOT: 1,
    NORMAL: 2
  },
  CategoryResult: {
    id(v) {
      return formateID("category", v.id);
    }
  },
  Mutation: {
    createCategory(_, { category }) {
      return Category.createCategory(category);
    },
    deleteCategory(_, { category }) {
      return Category.deleteCategory(category);
    },
    updateCategory(_, { category }) {
      return Category.updateCategory(category)
    }
  }
};

export const category = {
  resolvers,
  typeDef: CategorySchema
};
