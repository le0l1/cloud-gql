import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
import { createConnection } from 'typeorm';
import { makeServer, app } from './app';
import { setGraphqlContext } from './helper/auth/setContextUser';
import { env } from './helper/util';

makeServer(setGraphqlContext).applyMiddleware({ app });

// load enviroment
const getEnvPath = () => path.resolve(process.cwd(), '.env');

dotenv.config({ path: getEnvPath() });

// orm connection
export default createConnection().then(() => {
  app.listen({ port: env('PORT') }, () => {
    console.log(`🚀 Server ready at http://localhost:${env('PORT')}/graphql`);
  });
});
