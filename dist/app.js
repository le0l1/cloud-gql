(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["koa", "apollo-server-koa", "./Hello"], factory);
  } else if (typeof exports !== "undefined") {
    factory(require("koa"), require("apollo-server-koa"), require("./Hello"));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.koa, global.apolloServerKoa, global.Hello);
    global.app = mod.exports;
  }
})(this, function (_koa, _apolloServerKoa, _Hello) {
  "use strict";

  _koa = _interopRequireDefault(_koa);
  _Hello = _interopRequireDefault(_Hello);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  const server = new _apolloServerKoa.ApolloServer(_Hello.default);
  const app = new _koa.default();
  server.applyMiddleware({
    app
  });
  app.listen({
    port: 8080
  }, () => console.log(`🚀 Server ready at http://localhost:8080${server.graphqlPath}`));
});