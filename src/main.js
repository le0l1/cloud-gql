import dotenv from "dotenv";
import path from "path";
import { startServe } from "./app";

// load enviroment
const getEnvPath = () =>
  path.resolve(process.cwd(), `.env.${process.env.MODE}`);

dotenv.config({ path: getEnvPath() });


startServe();
