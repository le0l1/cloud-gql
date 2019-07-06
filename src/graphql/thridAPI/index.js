import { gql } from 'apollo-server-koa';
import ThirdAPI from './ThirdAPI.gql';
import { sendSMS } from '../../helper/thirdAPI/sms';
import { generateUploadToken } from '../../helper/thirdAPI/oss';
import { generateSMSCode } from '../../helper/util';
import { SMSCode } from './smsCode.entity';

const resolvers = {
  Query: {
    ossToken() {
      return generateUploadToken();
    },
    async smsCode(_, { phone }) {
      const smsCode = generateSMSCode();
      try {
        await sendSMS({ phone, smsCode });
        await SMSCode.save({
          phone,
          smsCode,
        });
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
