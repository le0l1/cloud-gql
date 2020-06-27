import 'dotenv/config';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { makeServer, app } from './app';
import { setGraphqlContext } from './helper/auth/setContextUser';
import { env } from './helper/util';

makeServer(setGraphqlContext).applyMiddleware({ app });

createConnection().then(() => {
  console.log('After Database Connecting...');
  app.listen({ port: env('PORT') }, () => {
    console.log(`🚀 Server ready at http://localhost:${env('PORT')}/graphql`);
  });
}).catch((err) => {
  console.err(err);
});
