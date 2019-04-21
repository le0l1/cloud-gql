import Banner from "./Banner.gql";
import { gql } from "apollo-server-koa";

export const banner = {
  typeDef: gql`
    ${Banner}
  `
};
