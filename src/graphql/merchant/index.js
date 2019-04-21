import Merchant from "./Merchant.gql";
import resolvers from "./resolver";
import { gql } from "apollo-server-koa";

export const merchant = {
  typeDef: gql`
    ${Merchant}
  `,
  resolvers
};
