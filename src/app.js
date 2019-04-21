import Koa from "koa";
import Router from "koa-router";
import { ApolloServer, gql } from "apollo-server-koa";
import { applyAuthRoute } from "./routes/auth";
import { merchant } from "./graphql/merchant";
import { koa as voyagerMiddleware } from "graphql-voyager/middleware";
import { banner } from "./graphql/banner";
import { demand } from "./graphql/demand";
import { good } from "./graphql/good";
import { recommend } from "./graphql/recommend";
import { dateResolver } from "./helper/scalar/Date";

const app = new Koa();
const router = new Router();

// router
applyAuthRoute(router);
app.use(router.routes()).use(router.allowedMethods());

// graphql voyager
router.all(
  "/voyager",
  voyagerMiddleware({
    endpointUrl: "/graphql"
  })
);

// apollo graphql
const typeDef = gql`
  type Query
`;
const server = new ApolloServer({
  typeDefs: [
    typeDef,
    merchant.typeDef,
    banner.typeDef,
    demand.typeDef,
    good.typeDef,
    recommend.typeDef
  ],
  resolvers: [hello.resolvers, merchant.resolvers, dateResolver]
});
server.applyMiddleware({ app });

app.listen({ port: 8080 }, () =>
  console.log(`🚀 Server ready at http://localhost:8080${server.graphqlPath}`)
);
