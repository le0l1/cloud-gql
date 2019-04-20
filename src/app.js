import Koa from "koa";
import { ApolloServer } from "apollo-server-koa";
import Hello from "./Hello";

const server = new ApolloServer(Hello);

const app = new Koa();
server.applyMiddleware({ app });

app.listen({ port: 8080 }, () =>
  console.log(`🚀 Server ready at http://localhost:8080${server.graphqlPath}`)
);
