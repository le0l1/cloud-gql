import PhoneSchema from './Phone.graphql';
import { Phone } from './phone.entity';
import { prop, formateID, pipe } from '../../helper/util';
import PhoneResolver from "./phone";

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
      return Phone.updatePhone(updatePhoneInput);
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
  },
};

export const phone = {
  typeDef: PhoneSchema,
  resolvers,
};
