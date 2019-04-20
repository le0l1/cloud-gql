import HelloSchema from "./Hello.gql";
import resolvers from "./resolver";
import { gql } from "apollo-server-koa";

export const hello = {
  typeDef: gql`
    ${HelloSchema}
  `,
  resolvers
};
