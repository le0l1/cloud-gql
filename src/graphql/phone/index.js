import PhoneSchema from "./Phone.graphql";
import {Phone} from "./phone.entity";

const resolvers = {
  Query: {
    phones(_, {query}) {
      return Phone.searchPhone(query);
    }
  },
  Phone: {
    shopId(v) {
      return formateID("shop", v.shopId);
    }
  }
}

export const phone = {
  typeDef: PhoneSchema,
  resolvers
}
