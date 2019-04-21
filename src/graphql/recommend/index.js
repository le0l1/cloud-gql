import Recommend from "./Recommend.gql";
import { gql } from "apollo-server-koa";

export const recommend = {
  typeDef: gql`
    ${Recommend}
  `
};
