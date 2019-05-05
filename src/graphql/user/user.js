import { formateID } from "../../helper/id";
import {
  hashPassword,
  comparePassword,
  generateToken
} from "../../helper/auth/encode";
import { gPlaceholderForPostgres } from "../../helper/util";

export const createUserModel = db => ({
  async addNewUser({ name, password, phone, garage, city, area, address }) {
    const client = await db.connect();
    try {
      const { hashed, salt } = hashPassword(password);
      const values = [name, phone, hashed, salt, garage, city, area, address];
      const res = await client.query(
        `INSERT INTO cloud_user (name, phone, password, salt, garage, city, area, address) VALUES (${gPlaceholderForPostgres(
          values.length
        )})  RETURNING id`,
        values
      );

      return {
        id: formateID("user", res.rows[0].id)
      };
    } finally {
      client.release();
    }
  },
  async findUserByPhone({ phone, password }) {
    const client = await db.connect();
    try {
      const res = await client.query(
        "SELECT * from cloud_user where phone = $1",
        [phone]
      );
      // if no user found throw error
      if (!res.rows[0]) throw new Error("User is not exists");

      // if password is valid throw error
      const { password: hashPassword, salt, ...rest } = res.rows[0];
      if (
        !comparePassword({
          hash: hashPassword,
          salt,
          pwd: password
        })
      ) {
        throw new Error("Password is valid");
      }

      return {
        ...rest,
        id: formateID("user", rest.id),
        token: generateToken(rest)
      };
    } finally {
      client.release();
    }
  }
});
