import OfferSchema from './Offer.graphql';
import { getOffers, getOffer, createOffer } from './offer';
import { formateID } from '../../helper/util';

const resolvers = {
  Query: {
    offers(_, { quoteId }) {
      return getOffers(quoteId);
    },
    offer(_, { id }) {
      return getOffer(id);
    },
  },
  Mutation: {
    createOffer(_, { input }, { currentUser }) {
      return createOffer(currentUser, input);
    },
  },
  Offer: {
    id(v) {
      return formateID('offer', v.id);
    },
    userId(v) {
      return formateID('user', v.userId);
    },
    quoteId(v) {
      return formateID('quote', v.quoteId);
    },
  },
  OfferNode: {
    id(v) {
      return formateID('offer', v.id);
    },
    userId(v) {
      return formateID('user', v.userId);
    },
    quoteId(v) {
      return formateID('quote', v.quoteId);
    },
  },
};

export default {
  typeDef: OfferSchema,
  resolvers,
};
