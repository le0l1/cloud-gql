"use strict";

var Koa = require('koa');

var _require = require('apollo-server-koa'),
    ApolloServer = _require.ApolloServer,
    gql = _require.gql;

var Hello = require("./schema/hello");

var server = new ApolloServer(Hello);
var app = new Koa();
server.applyMiddleware({
  app: app
});
app.listen({
  port: 8080
}, function () {
  return console.log("\uD83D\uDE80 Server ready at http://localhost:8080".concat(server.graphqlPath));
});