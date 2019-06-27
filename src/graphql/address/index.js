import AddressSchema from './Address.graphql';
import AddressResolver from './address';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    address(_, { addressQuery }) {
      return AddressResolver.searchAddress(addressQuery);
    },
  },
  Mutation: {
    createAddress(_, { createAddressInput }) {
      return AddressResolver.createAddress(createAddressInput);
    },
    updateAddress(_, { updateAddressInput }) {
      return AddressResolver.updateAddress(updateAddressInput);
    },
    deleteAddress(_, { deleteAddressInput }) {
      return AddressResolver.deleteAddress(deleteAddressInput);
    },
  },
  Address: idResolver('address'),
  AddressActionResult: {
    ...idResolver('address'),
    status: () => true,
  },
};
export default {
  typeDef: AddressSchema,
  resolvers,
};
