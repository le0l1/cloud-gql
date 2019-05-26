import Root from "./Root.gql";

const resolvers = {
  PageInfo: {
    total(v) {
      return v[1] || 0;
    },
    hasNextPage(v) {
      return v[1] > 0;
    }
  },
  Node: {
    __resolveType(data) {
      return data.constructor.name;
    }
  }
};

export const root = {
  typeDef: Root,
  resolvers
};
