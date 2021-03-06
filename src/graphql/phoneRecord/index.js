import PhoneRecordSchema from './phoneRecord.graphql';
import { searchPhoneRecords, createPhoneRecord } from './phoneRecord';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    phoneRecords(_, { query }, { currentUser }) {
      return searchPhoneRecords(currentUser, query);
    },
  },
  Mutation: {
    createPhoneRecord(_, { input }) {
      return createPhoneRecord(input);
    },
  },
  PhoneRecord: idResolver('phoneRecord'),
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
