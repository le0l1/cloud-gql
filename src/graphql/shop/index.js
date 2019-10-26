import ShopSchema from './Shop.graphql';
import { formateID } from '../../helper/util';
import { ShopStatus } from '../../helper/status';
import ShopResolver from './shop';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    shops(_, { query = {} }, context) {
      return ShopResolver.searchShops({
        ...query,
        city: context.city,
      });
    },
    shop(_, { query }) {
      return ShopResolver.searchShop(query);
    },
    shopCity() {
      return ShopResolver.searchShopCity();
    },
  },
  ShopConnection: {
    edges(result) {
      return result[0];
    },
    pageInfo(v) {
      return v;
    },
  },
  Shop: {
    id(v) {
      return formateID('shop', v.id);
    },
    belongto(v) {
      return formateID('user', v.belongto);
    },
  },
  ShopStatus,
  ShopResult: idResolver('shop'),
  Mutation: {
    createShop(_, { shopCreateInput }) {
      return ShopResolver.createShop(shopCreateInput);
    },
    deleteShop(_, { shopDeleteInput }) {
      return ShopResolver.deleteShop(shopDeleteInput);
    },
    updateShop(_, { shopUpdateInput }) {
      return ShopResolver.updateShop(shopUpdateInput);
    },
    updateShopRank(_, { input }) {
      return ShopResolver.updateShopIndex(input);
    },
  },
};

export const shop = {
  typeDef: ShopSchema,
  resolvers,
};
