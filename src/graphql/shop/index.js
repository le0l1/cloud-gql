import ShopSchema from "./Shop.graphql";
import { formateID } from "../../helper/id";
import { Shop } from "./shop.entity";

const resolvers = {
  Query: {
    shops(_, { query = {} }) {
      return Shop.searchShopList(query);
    },
    shop(_, { query }) {
      return Shop.searchShop(query);
    }
  },
  ShopConnection: {
    edges(result) {
      return result[0];
    },
    pageInfo(v) {
      return v;
    }
  },
  Shop: {
    id(v) {
      return formateID("shop", v.id);
    },
    shopImages(v) {
      return (v.shopImages || []).map(a => a.path)
    },
    shopBanners(v) {
      return (v.shopBanners || []).map(a => a.path)
    }
  },
  ShopStatus: {
    NORMAL: 1,
    SUSPEND: 2
  },
  Mutation: {
    createShop(_, { shopCreateInput }) {
      return Shop.createShop(shopCreateInput);
    },
    deleteShop(_, { shopDeleteInput }) {
      return Shop.deleteShop(shopDeleteInput);
    },
    updateShop(_, { shopUpdateInput }) {
      return Shop.updateShop(shopUpdateInput);
    }
  }
};

export const shop = {
  typeDef: ShopSchema,
  resolvers
};
