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
    async smsCode(_, { phone }, ctx) {
      const user = createUserModel(db);
      const isRegistried = await user.checkUserExists(phone);

      if (isRegistried) {
        throw new Error("User has alreayd register");
      }

      const smsCode = generateSMSCode();
      await sendSMS({ phone, smsCode });
      // set smsCode to session
      ctx.session.smsCode = smsCode;
      return true;
    }
  }
};

export const thirdAPI = {
  typeDef: gql`
    ${ThirdAPI}
  `,
  resolvers
};
