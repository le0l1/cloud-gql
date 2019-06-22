import { createConnection } from 'typeorm'

export class DBConnect  {
  static connection = null

  static async connect () {
    if (DBConnect.connection) return DBConnect.connection;
    this.connection = await createConnection()
  }

  stop () {
    this.connection.close()
  }
}
