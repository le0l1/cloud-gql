import PhoneRecordSchema from './phoneRecord.graphql';
import { searchPhoneRecords, createPhoneRecord } from './phoneRecord';
import { idResolver } from '../../helper/resolver';
import { formateID } from '../../helper/util';

const resolvers = {
  Query: {
    phoneRecords(_, { query }) {
      return searchPhoneRecords(query);
    },
  },
  Mutation: {
    createPhoneRecord(_, { input }) {
      return createPhoneRecord(input);
    },
  },
  PhoneRecord: {
    ...idResolver('phoneRecord'),
    userId(v) {
      return formateID('user', v.userId);
    },
  },
  PhoneRecordConnection: {
    edges(v) {
      return v[0];
    },
    pageInfo(v) {
      return v;
    },
  },
};

export default {
  typeDef: PhoneRecordSchema,
  resolvers,
};
