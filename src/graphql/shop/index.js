import ShopSchema from "./Shop.gql";
import { gql } from "apollo-server-koa";
import { createShopModel } from "./shop";
import { db } from "../../helper/database/db";
import { formateID } from "../../helper/id";

const resolvers = {
  Query: {
    shops(_, { query = {} }) {
      const shopModel = createShopModel(db);
      return shopModel.searchShop(query);
    }
  },
  ShopConnection: {
    edges(result) {
      return result;
    },
    pageInfo(result) {
      return {
        hasNextPage: result.length > 0,
        total: result.length > 0 ? result[0].total : 0
      };
    }
  },
  Shop: {
    id(v) {
      return formateID("shop", v.id);
    }
  },
  ShopStatus: {
    NORMAL: 1,
    SUSPEND: 2
  },
  Mutation: {
    createShop(_, { shopCreateInput }) {
      const shopModel = createShopModel(db);
      return shopModel.createShop(shopCreateInput);
    },
    deleteShop(_, { shopDeleteInput }) {
      const shopModel = createShopModel(db);
      return shopModel.deleteShop(shopDeleteInput);
    },
    updateShop(_, { shopUpdateInput }) {
      const shopModel = createShopModel(db);
      return shopModel.updateShop(shopUpdateInput);
    }
  }
};

export const shop = {
  typeDef: gql`
    ${ShopSchema}
  `,
  resolvers
};
