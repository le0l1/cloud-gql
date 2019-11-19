import Koa from 'koa';
import parameter from 'koa-parameter';
import bodyparser from 'koa-bodyparser';
import xmlParser from 'koa-xml-body';
import session from 'koa-session';
import { ApolloServer } from 'apollo-server-koa';
import { koa as voyagerMiddleware } from 'graphql-voyager/middleware';
import { banner } from './graphql/banner';
import { good } from './graphql/good';
import { recommend } from './graphql/recommend';
import { dateResolver } from './helper/scalar/Date';
import { businessCircle } from './graphql/businessCircle';
import { user } from './graphql/user';
import { AuthDriective } from './helper/directive/authDirective';
import { root } from './graphql/root';
import { numberResolver } from './helper/scalar/Number';
import { category } from './graphql/category';
import { shop } from './graphql/shop';
import { thirdAPI } from './graphql/thridAPI';
import { comment } from './graphql/comment';
import { goodAttribute } from './graphql/goodAttribute';
import { sku } from './graphql/sku';
import { accessories } from './graphql/accessories';
import { rfq } from './graphql/rfq';
import { image } from './graphql/image';
import { phone } from './graphql/phone';
import { coupon } from './graphql/coupon';
import order from './graphql/order';
import payment from './graphql/payment';
import transfer from './graphql/transfer';
import cart from './graphql/cart';
import address from './graphql/address';
import collection from './graphql/collection';
import news from './graphql/news';
import history from './graphql/history';
import withdraw from './graphql/withdraw';
import hot from './graphql/hot';
import statistics from './graphql/statistics';
import activity from './graphql/activity';
import checkIn from './graphql/checkIn';
import redPacket from './graphql/redPacket';
import goldProduct from './graphql/goldProduct';
import goldOrder from './graphql/goldOrder';
import device from './graphql/device';
import phoneRecord from './graphql/phoneRecord';
import video from './graphql/video';
import quote from './graphql/quote';
import offer from './graphql/offer';
import paymentRouter from './payment';
import { BasicLoggin, BasicLogging } from './helper/logger';

const app = new Koa();

app.keys = ['asdqwdqwdqqwdqdqwd'];

app.use(xmlParser());
app.use(bodyparser());
app.use(session(app));
parameter(app);

// 支付网关
app
  .use(paymentRouter.routes())
  .use(paymentRouter.allowedMethods());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message,
    };
  }
});


export const makeServer = context => new ApolloServer({
  typeDefs: [
    root.typeDef,
    banner.typeDef,
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
    phone.typeDef,
    coupon.typeDef,
    order.typeDef,
    payment.typeDef,
    transfer.typeDef,
    cart.typeDef,
    address.typeDef,
    collection.typeDef,
    news.typeDef,
    history.typeDef,
    withdraw.typeDef,
    hot.typeDef,
    statistics.typeDef,
    activity.typeDef,
    checkIn.typeDef,
    redPacket.typeDef,
    goldProduct.typeDef,
    goldOrder.typeDef,
    device.typeDef,
    phoneRecord.typeDef,
    video.typeDef,
    quote.typeDef,
    offer.typeDef,
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
    image.resolvers,
    businessCircle.resolvers,
    phone.resolvers,
    coupon.resolvers,
    order.resolvers,
    transfer.resolvers,
    payment.resolvers,
    cart.resolvers,
    address.resolvers,
    collection.resolvers,
    news.resolvers,
    history.resolvers,
    withdraw.resolvers,
    hot.resolvers,
    statistics.resolvers,
    activity.resolvers,
    checkIn.resolvers,
    redPacket.resolvers,
    goldProduct.resolvers,
    goldOrder.resolvers,
    device.resolvers,
    phoneRecord.resolvers,
    video.resolvers,
    quote.resolvers,
    offer.resolvers,
  ],
  context,
  schemaDirectives: {
    auth: AuthDriective,
  },
  playground: {
    settings: {
      'request.credentials': 'include',
    },
  },
  extensions: [() => new BasicLogging()],
});

export { app };
