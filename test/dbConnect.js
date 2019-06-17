import { createConnection } from "typeorm";

export class DBConnect {
  connection = null
  async connect() {
    this.connection = await createConnection();
  }
  stop() {
    this.connection.close();
  }
}