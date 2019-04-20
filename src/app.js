import Koa from "koa";
import { ApolloServer, gql } from "apollo-server-koa";
import { hello } from "./schema/hello";

const typeDef = gql`
  type Query
`;

const server = new ApolloServer({
  typeDefs: [typeDef, hello.typeDef],
  resolvers: [hello.resolvers]
});

const app = new Koa();
server.applyMiddleware({ app });

app.listen({ port: 8080 }, () =>
  console.log(`🚀 Server ready at http://localhost:8080${server.graphqlPath}`)
);
