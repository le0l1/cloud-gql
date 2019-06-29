import Root from './Root.graphql';

const resolvers = {
  PageInfo: {
    total(v) {
      return v[1] || 0;
    },
  },
  Node: {
    __resolveType(data) {
      return data.constructor.name;
    },
  },
};

export const root = {
  typeDef: Root,
  resolvers,
};
