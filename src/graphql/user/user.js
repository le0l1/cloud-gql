import { formateID, decodeID } from "../../helper/id";
import {
  hashPassword,
  comparePassword,
  generateToken
} from "../../helper/auth/encode";
import {
  gPlaceholderForPostgres,
  isValid,
  addCondition,
  excuteQuery
} from "../../helper/util";
import { User } from "./user.entity";

export const createUserModel = db => ({
  async addNewUser({
    name,
    password,
    phone,
    garage,
    city,
    area,
    address,
    role
  }) {
    const createFn = async client => {
      const { hashed, salt } = hashPassword(password);
      const values = [
        name,
        phone,
        hashed,
        salt,
        garage,
        city,
        area,
        address,
        role
      ];
      const res = await client.query(
        `INSERT INTO cloud_user (name, phone, password, salt, garage, city, area, address, role) VALUES (${gPlaceholderForPostgres(
          values.length
        )})  RETURNING id`,
        values
      );

      return {
        id: formateID("user", res.rows[0].id)
      };
    };
    return excuteQuery(db)(createFn);
  },
  async findUserByPhone({ phone, password }) {
    const client = await db.connect();
    try {
      const res = await client.query(
        "SELECT * from cloud_user where phone = $1",
        [phone]
      );
      // if no user found throw error
      if (!res.rows[0]) throw new Error("该用户不存在");

      // if password is valid throw error
      const { password: hashPassword, salt, ...rest } = res.rows[0];
      if (
        !comparePassword({
          hash: hashPassword,
          salt,
          pwd: password
        })
      ) {
        throw new Error("密码错误");
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
  fuzzySearchUser({ tsQuery, limit = 10, filters, offset = 0 }) {
    const searchUser = async client => {
      let query = {
        sql:
          "SELECT * , COUNT(*) OVER() as total FROM cloud_user limit $1 offset $2",
        payload: [limit, offset]
      };

      const conditionMap = [
        {
          condition: idx =>
            `(name LIKE '%' || $${idx} || '%' OR phone LIKE '%' || $${idx} || '%')`,
          val: tsQuery,
          formate: v => v
        },
        {
          condition: idx => {
            return Object.keys(filters)
              .map((k, i) => {
                return `${k}=$${idx + i}`;
              })
              .join(" AND ");
          },
          val: filters,
          formate: Object.values
        }
      ];

      query = conditionMap.reduce((a, b) => {
        return isValid(b.val)
          ? {
              sql: addCondition(a.sql, b.condition(a.payload.length + 1)),
              payload: [...a.payload, b.formate(b.val)].flat()
            }
          : a;
      }, query);
      const res = await client.query(query.sql, query.payload);

      const resFilter = arr =>
        arr.map(({ id, password, ...rest }) => {
          return {
            id,
            ...rest
          };
        });
      return res.rows.length ? resFilter(res.rows) : [];
    };

    return excuteQuery(db)(searchUser);
  },
  deleteUserByID({ id }) {
    const deleteUser = async client => {
      const res = await client.query("DELETE FROM cloud_user WHERE id=$1;", [
        decodeID(id)
      ]);
      return {
        id: id,
        status: true
      };
    };
    return excuteQuery(db)(deleteUser);
  }
});
