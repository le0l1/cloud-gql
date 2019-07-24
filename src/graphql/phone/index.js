import PhoneSchema from './Phone.graphql';
import { prop, formateID, pipe } from '../../helper/util';
import PhoneResolver from './phone';

const formatePhoneId = pipe(
  prop('id'),
  formateID.bind(null, 'phone'),
);

const resolvers = {
  Query: {
    phones(_, { query }) {
      return PhoneResolver.searchPhones(query);
    },
  },
  Mutation: {
    updatePhone(_, { updatePhoneInput }) {
      return PhoneResolver.updatePhone(updatePhoneInput);
    },
  },
  Phone: {
    shopId(v) {
      return formateID('shop', v.shopId);
    },
    id: formatePhoneId,
  },
  PhoneActionResult: {
    id: formatePhoneId,
    status: () => true,
  },
};

export const phone = {
  typeDef: PhoneSchema,
  resolvers,
};
