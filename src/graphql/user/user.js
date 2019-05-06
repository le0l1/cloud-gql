import { formateID, decodeID } from "../../helper/id";
import {
  hashPassword,
  comparePassword,
  generateToken
} from "../../helper/auth/encode";
import { gPlaceholderForPostgres } from "../../helper/util";

const excuteQuery = db => async cb => {
   const client = await db.connect();
   try {
     return cb(client)
   } finally {
     client.release();
   }
}

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
  },
  async fuzzySearchUser({ tsQuery, first = 10, after = null }) {
    const client = await db.connect();
    try {
      const getQuery = () =>  {
        if (after) {
         return "SELECT * , COUNT(*) OVER() as total FROM cloud_user WHERE (name LIKE '%' || $1 || '%' OR phone LIKE '%' || $1 || '%') AND created_at > $2 LIMIT $3 ;" 
        } 
        return "SELECT * , COUNT(*) OVER() as total FROM cloud_user WHERE (name LIKE '%' || $1 || '%' OR phone LIKE '%' || $1 || '%') LIMIT $2 ;"
      }
      const getPayload = () => after ? [tsQuery, new Date(decodeID(after)), first] : [tsQuery, first]

      const res = await client.query(
        getQuery(),
        getPayload()
      );

      const resFilter = arr =>
        arr.map(({ id, password, ...rest }) => {
          return {
            cursor: formateID("user", rest.created_at),
            node: {
              id: formateID("user", id),
              ...rest
            }
          };
        });

      return res.rows.length ? resFilter(res.rows) : [];
    } finally {
      client.release();
    }
  },
  deleteUserByID({ id }) {
    const deleteUser = async client => {
      const res = await client.query(
        "DELETE FROM cloud_user WHERE id=$1;",
        [decodeID(id)]
      )
      return {
        id: id,
        status: true
      }
    }
    return excuteQuery(db)(deleteUser);
  }
});
