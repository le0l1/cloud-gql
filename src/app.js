const Koa = require('koa');
const { ApolloServer, gql } = require('apollo-server-koa');
const Hello = require("./schema/hello")

const server = new ApolloServer(Hello);
 
const app = new Koa();
server.applyMiddleware({ app });
 
app.listen({ port: 8080 }, () =>
  console.log(`🚀 Server ready at http://localhost:8080${server.graphqlPath}`),
);