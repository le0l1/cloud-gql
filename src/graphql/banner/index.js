import BannerSchema from "./Banner.gql";
import { formateID } from "../../helper/id";
import { Banner } from "./banner.entity";

const resolvers = {
  Query: {
    banners(_, { bannerQueryInput }) {
      return Banner.searchBanner(bannerQueryInput);
    }
  },
  Mutation: {
    createBanner(_, { bannerInput }) {
      return Banner.createBanner(bannerInput);
    },
    deleteBanner(_, { id }) {
      return Banner.deleteBanner(id);
    },
    updateBanner(_, { bannerUpdateInput }) {
      return Banner.updateBanner(bannerUpdateInput);
    }
  },
  Banner: {
    id(v) {
      return v.id ? formateID("banner", v.id) : null;
    }
  }
};

export const banner = {
  typeDef: BannerSchema,
  resolvers
};
