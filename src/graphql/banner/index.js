import BannerSchema from './Banner.graphql';
import { Banner } from './banner.entity';
import { formateID } from '../../helper/util';
import BannerResolver from './banner';

const resolvers = {
  Query: {
    banners(_, { bannerQueryInput }) {
      return BannerResolver.searchBanners(bannerQueryInput);
    },
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
    },
  },
  Banner: {
    id(v) {
      return v.id ? formateID('banner', v.id) : null;
    },
  },
};

export const banner = {
  typeDef: BannerSchema,
  resolvers,
};
