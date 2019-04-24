import Koa from "koa";
import Router from "koa-router";
import parameter from "koa-parameter";
import bodyparser from "koa-bodyparser";
import { ApolloServer, gql } from "apollo-server-koa";
import { applyAuthRoute } from "./routes/auth";
import { merchant } from "./graphql/merchant";
import { koa as voyagerMiddleware } from "graphql-voyager/middleware";
import { banner } from "./graphql/banner";
import { demand } from "./graphql/demand";
import { good } from "./graphql/good";
import { recommend } from "./graphql/recommend";
import { dateResolver } from "./helper/scalar/Date";
import { businessCircle } from "./graphql/businessCircle";
import { user } from "./graphql/user";
import { setGraphqlContext } from "./helper/auth/setContextUser";
import { AuthDriective } from "./helper/directives/authDirective";
import { root } from "./graphql/root";



const app = new Koa();
const router = new Router();

//body parser
app.use(bodyparser());

// paramter validate
parameter(app);

// error handing
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message
    };
  }
});

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


const server = new ApolloServer({
  typeDefs: [
    root.typeDef,
    merchant.typeDef,
    banner.typeDef,
    demand.typeDef,
    good.typeDef,
    recommend.typeDef,
    businessCircle.typeDef,
    user.typeDef
  ],
  resolvers: [merchant.resolvers, dateResolver, user.resolvers],
  context: setGraphqlContext,
  schemaDirectives: {
    auth: AuthDriective
  },
});
server.applyMiddleware({ app });


export const startServe = () =>
  app.listen({ port: process.env.PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`)
  );
