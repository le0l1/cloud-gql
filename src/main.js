import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import { startServe } from "./app";
import {createConnection } from "typeorm";

// load enviroment
const getEnvPath = () => path.resolve(process.cwd(), `.env`);

dotenv.config({ path: getEnvPath() });

// orm connection
export default createConnection().then(startServe)
