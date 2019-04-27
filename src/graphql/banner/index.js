import Banner from "./Banner.gql";
import { gql } from "apollo-server-koa";

const resolvers = {
  Query: {
    banners() {
      return [];
    }
  }
};

export const banner = {
  typeDef: gql`
    ${Banner}
  `,
  resolvers
};
