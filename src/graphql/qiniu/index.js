import { gql } from "apollo-server-koa";
import QiNiu from "./QiNiu.gql";
import { generateUploadToken } from "../../helper/file/upload";

const resolvers = {
  Query: {
    ossToken() {
      return generateUploadToken();
    }
  }
};

export const qiniu = {
  typeDef: gql`
    ${QiNiu}
  `,
  resolvers
};
