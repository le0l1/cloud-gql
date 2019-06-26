import { gql } from 'apollo-server-koa';
import Demand from './Demand.gql';

export const demand = {
  typeDef: gql`
    ${Demand}
  `,
};
