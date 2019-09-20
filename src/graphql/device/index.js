import DeviceSchema from './Device.graphql';
import DeviceResolver from './device';
import { formateID } from '../../helper/util';

const resolvers = {
  Mutation: {
    bindDevice(_, { input }) {
      return DeviceResolver.bindDevice(input);
    },
  },
  Device: {
    userId: v => formateID('user', v.userId),
  },
};

export default {
  typeDef: DeviceSchema,
  resolvers,
};
