import Category from "./Category.gql";
import { gql } from "apollo-server-koa";
import { createCategoryModel } from "./category";
import { db } from "../../helper/database/db";
import { formateID } from "../../helper/id";

const resolvers = {
  Query: {
    categorys(_, { query = {} }) {
      const categoryModel = createCategoryModel(db);
      return categoryModel.searchCategorys(query);
    },
    category(_, { query = {}}) {
     const categoryModel = createCategoryModel(db);
     return categoryModel.searchCategory(query); 
    }
  },
  Category: {
    id(v) {
      return formateID('category', v.id)
    }
  },
  CategoryStatus: {
    HOT: 1,
    NORMAL: 2
  },
  Mutation: {
    createCategory(_, { category }) {
      const categoryModel = createCategoryModel(db);
      return categoryModel.createCategory(category);
    },
    deleteCategory(_, { category }) {
      const categoryModel = createCategoryModel(db);
      return categoryModel.deleteCategory(category);
    },
    updateCategory(_, { category }) {
      const categoryModel = createCategoryModel(db);
      return categoryModel.updateCategory(category);
    }
  }
};

export const category = {
  resolvers,
  typeDef: gql`
    ${Category}
  `
};
