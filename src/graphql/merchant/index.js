import { gql } from 'apollo-server-koa';
import Merchant from './Merchant.gql';
import resolvers from './resolver';

export const merchant = {
  typeDef: gql`
    ${Merchant}
  `,
  resolvers,
};
