import { createConnection } from "typeorm";
import { makeServer, app } from "../src/app";

makeServer(() => ({
  session: {
    1111111111: "000000"
  }
})).applyMiddleware({ app });

export default async () => {
  global.connection = await createConnection();
  global.server = app.listen({ port: process.env.PORT }, () => {
    console.log("start test server");
  });
};
