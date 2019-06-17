import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import { makeServer, app } from "./app";
import { createConnection } from "typeorm";
import { setGraphqlContext } from "./helper/auth/setContextUser";

makeServer(setGraphqlContext).applyMiddleware(app);

// load enviroment
const getEnvPath = () => path.resolve(process.cwd(), `.env`);

dotenv.config({ path: getEnvPath() });

// orm connection
export default createConnection().then(() => {
  app.listen({ port: process.env.PORT }, () => {
    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT}/graphql`
    );
  });
});
