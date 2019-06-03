import ShopSchema from "./Shop.gql";
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
    phone(v) {
      return v.phone.map(a => a.phone)
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
