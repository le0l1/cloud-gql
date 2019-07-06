import { gql } from 'apollo-server-koa';
import ThirdAPI from './ThirdAPI.gql';
import { sendSMS } from '../../helper/thirdAPI/sms';
import { generateUploadToken } from '../../helper/thirdAPI/oss';
import { generateSMSCode } from '../../helper/util';

const resolvers = {
  Query: {
    ossToken() {
      return generateUploadToken();
    },
    async smsCode(_, { phone }, ctx) {
      const smsCode = generateSMSCode();
      try {
        await sendSMS({ phone, smsCode });
        // set smsCode to session
        ctx.session[phone] = smsCode;
        return true;
      } catch (e) {
        throw e;
      }
    },
  },
};

export const thirdAPI = {
  typeDef: gql`
    ${ThirdAPI}
  `,
  resolvers,
};
