import Root from "./Root.gql";

const resolvers = {
  PageInfo: {
    total(v) {
      return v[1] || 0;
    },
    hasNextPage(v) {
      return v[1] > 0;
    }
  }
};

export const root = {
  typeDef: Root,
  resolvers
};
