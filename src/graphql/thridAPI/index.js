import ThirdAPI from "./ThirdAPI.gql";
import { gql } from "apollo-server-koa";
import { sendSMS } from "../../helper/thirdAPI/sms";
import { generateUploadToken } from "../../helper/thirdAPI/oss";
import { generateSMSCode } from "../../helper/util";
import { createUserModel } from "../user/user";
import { db } from "../../db";

const resolvers = {
  Query: {
    ossToken() {
      return generateUploadToken();
    },
    async smsCode(_, { phone }) {
      const user = createUserModel(db);
      const isRegistried = user.checkUserExists(phone);

      if (!isRegistried) {
        const smsCode = generateSMSCode();
        await sendSMS({ phone, smsCode });
        return smsCode;
      } else {
        throw new Error("User has alreayd register");
      }
    }
  }
};

export const thirdAPI = {
  typeDef: gql`
    ${ThirdAPI}
  `,
  resolvers
};
