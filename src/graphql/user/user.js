import { formateID } from "../../helper/id";
import { hashPassword, comparePassword } from "../../helper/auth/encode";

export const createUserModel = db => ({
  async addNewUser({ name, password, phone }) {
    const client = await db.connect();
    try {
      const { hashed, salt } = hashPassword(password);
      const res = await client.query(
        "INSERT INTO cloud_user (name, phone, password, salt) VALUES ($1, $2, $3, $4)  RETURNING id",
        [name, phone, hashed, salt]
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
        token: '123'
      };
    } finally {
      client.release();
    }
  }
});
