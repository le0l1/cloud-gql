import { gql } from "apollo-server-koa";

const typeDefs = gql`
  type Query {
    hello: String
    age: Number
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => "Hello world!",
    age: () => 1
  }
};

export default {
  typeDefs,
  resolvers
};
