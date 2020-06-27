import 'dotenv/config';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { makeServer, app } from './app';
import { setGraphqlContext } from './helper/auth/setContextUser';
import { env } from './helper/util';

makeServer(setGraphqlContext).applyMiddleware({ app });

try {
  // orm connection
  createConnection().then(() => {
    app.listen({ port: env('PORT') }, () => {
      console.log(`🚀 Server ready at http://localhost:${env('PORT')}/graphql`);
    });
  });
} catch (e) {
  console.error('Serve Crashed:', e);
}
