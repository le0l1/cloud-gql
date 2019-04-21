import Demand from "./Demand.gql";
import { gql } from "apollo-server-koa";

export const demand = {
  typeDef: gql`
    ${Demand}
  `
};
