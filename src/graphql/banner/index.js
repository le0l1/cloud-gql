import Banner from "./Banner.gql";
import { gql } from "apollo-server-koa";
import { createBannerModel } from "./Banner";
import { db } from "../../db";

const resolvers = {
  Query: {
    banners(_, { bannerQueryInput }) {
      const banner = createBannerModel(db);
      return banner.findBannerByTag(bannerQueryInput);
    }
  },
  Mutation: {
    addBanner(_, { bannerInput }) {
      const banner = createBannerModel(db);
      return banner.addBanner(bannerInput);
    },
    deleteBanner(_, { id }) {
      const banner = createBannerModel(db);
      return banner.deletBanner(id);
    },
    updateBanner(_, { bannerUpdateInput }) {
      const banner = createBannerModel(db);
      return banner.updateBanner(bannerUpdateInput);
    }
  }
};

export const banner = {
  typeDef: gql`
    ${Banner}
  `,
  resolvers
};
