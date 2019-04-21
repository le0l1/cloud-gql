import Good from "./Good.gql";
import { gql } from "apollo-server-koa";

export const good = {
  typeDef: gql`
    ${Good}
  `
};
