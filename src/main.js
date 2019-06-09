import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import { startServe } from "./app";
import {createConnection } from "typeorm";
import {
  getOperationDefinition,
  argumentsObjectFromField
} from "apollo-utilities";

// load enviroment
const getEnvPath = () => path.resolve(process.cwd(), `.env`);

dotenv.config({ path: getEnvPath() });

// orm connection
createConnection().then(() => {
  startServe();
})
