import Koa from "koa";
import Router from "koa-router";
import parameter from "koa-parameter";
import bodyparser from "koa-bodyparser";
import session from "koa-session";
import { ApolloServer, gql } from "apollo-server-koa";
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
import { AuthDriective } from "./helper/auth/authDirective";
import { root } from "./graphql/root";
import { numberResolver } from "./helper/scalar/Number";
import { category } from "./graphql/category";
import { shop } from "./graphql/shop";
import { thirdAPI } from "./graphql/thridAPI";
import { comment } from "./graphql/comment";
import { goodAttribute } from "./graphql/goodAttribute";
import { sku } from "./graphql/sku";
import { accessories } from "./graphql/accessories";
import { rfq } from "./graphql/rfq";
import { image } from "./graphql/image";

const app = new Koa();
const router = new Router();

app.keys = ["asdqwdqwdqqwdqdqwd"];

//body parser
app.use(bodyparser());

// session
app.use(session(app));

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
    banner.typeDef,
    demand.typeDef,
    good.typeDef,
    recommend.typeDef,
    businessCircle.typeDef,
    user.typeDef,
    category.typeDef,
    shop.typeDef,
    thirdAPI.typeDef,
    comment.typeDef,
    goodAttribute.typeDef,
    sku.typeDef,
    accessories.typeDef,
    rfq.typeDef,
    image.typeDef,
  ],
  resolvers: [
    dateResolver,
    numberResolver,
    root.resolvers,
    user.resolvers,
    banner.resolvers,
    category.resolvers,
    shop.resolvers,
    thirdAPI.resolvers,
    comment.resolvers,
    recommend.resolvers,
    good.resolvers,
    goodAttribute.resolvers,
    sku.resolvers,
    accessories.resolvers,
    rfq.resolvers,
    image.resolvers
  ],
  context: setGraphqlContext,
  schemaDirectives: {
    auth: AuthDriective
  },
  playground: {
    settings: {
      "request.credentials": "include"
    }
  }
});
server.applyMiddleware({ app });

export const startServe = () =>
  app.listen({ port: process.env.PORT }, () =>
    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT}${
        server.graphqlPath
      }`
    )
  );
