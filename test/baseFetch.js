import { GraphQLClient } from "graphql-request";

const endpoint = 'http://localhost:4500/graphql'

export class BaseFetch {
  client = new GraphQLClient(endpoint);
}