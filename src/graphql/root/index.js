import Root from "./Root.gql"
import { gql } from "apollo-server-koa";

export const root = {
  typeDef: gql`${Root}`
}