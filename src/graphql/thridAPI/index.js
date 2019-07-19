import { gql } from 'apollo-server-koa';
import ThirdAPI from './ThirdAPI.gql';
import { sendSMS } from '../../helper/thirdAPI/sms';
import { generateUploadToken } from '../../helper/thirdAPI/oss';
import { generateSMSCode } from '../../helper/util';
import { SMSCode } from './smsCode.entity';
import logger from '../../helper/logger';
import ThirdAPIResolver from './thirdAPI';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    ossToken() {
      return generateUploadToken();
    },
    async smsCode(_, { phone }) {
      const smsCode = generateSMSCode();
      try {
        await sendSMS({ phone, smsCode });
        logger.info(`手机号码: ${phone}, 验证码: ${smsCode}`);
        await SMSCode.save({
          phone,
          smsCode,
        });
        return true;
      } catch (e) {
        throw e;
      }
    },
    vin(_, { vin }) {
      return ThirdAPIResolver.searchVin(vin);
    },
  },
  Mutation: {
    updateVin(_, { input }) {
      return ThirdAPIResolver.updateVin(input);
    },
  },
  VehicleInfo: idResolver('vehicleInfo'),
};

export const thirdAPI = {
  typeDef: gql`
    ${ThirdAPI}
  `,
  resolvers,
};
