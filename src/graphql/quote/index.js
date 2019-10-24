import QuoteSchema from './Quote.graphql';
import {
  searchQuotes, searchQuote, createQuote, searchCustomerQuotes, deleteQuote,
} from './quote';
import { idResolver } from '../../helper/resolver';
import { formateID } from '../../helper/util';

const resolvers = {
  Query: {
    quotes(_, { query = {} }, { currentUser }) {
      return searchQuotes(currentUser, query);
    },
    quote(_, { id }) {
      return searchQuote(id);
    },
    customerQuotes(_, params, { currentUser }) {
      return searchCustomerQuotes(currentUser);
    },
  },
  Mutation: {
    createQuote(_, { input }, { currentUser }) {
      return createQuote(currentUser, input);
    },
    deleteQuote(_, { id }) {
      return deleteQuote(id);
    },
  },
  Quote: {
    ...idResolver('quote'),
    userId(v) {
      return formateID('user', v.userId);
    },
  },
  QuoteNode: {
    ...idResolver('quote'),
    userId(v) {
      return formateID('user', v.userId);
    },
  },
  QuoteConnection: {
    edges(v) {
      return v[0];
    },
    pageInfo(v) {
      return v;
    },
  },
};

export default {
  typeDef: QuoteSchema,
  resolvers,
};
