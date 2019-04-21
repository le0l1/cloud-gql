import BusinessCircle from "./BusinessCircle.gql";
import { gql } from "apollo-server-koa";

export const businessCircle = {
  typeDef: gql`
    ${BusinessCircle}
  `
};
