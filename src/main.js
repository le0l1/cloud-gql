import dotenv from "dotenv";
import path from "path";
import { startServe } from "./app";
import {
  getOperationDefinition,
  argumentsObjectFromField
} from "apollo-utilities";

// load enviroment
const getEnvPath = () => path.resolve(process.cwd(), `.env`);

dotenv.config({ path: getEnvPath() });

import "./helper/database/sql";
startServe();
