import { formateID, decodeID } from "../../helper/id";
import { excuteQuery, isValid, addCondition } from "../../helper/util";

export const createCategoryModel = db => ({
  createCategory({ id, name, status, tag }) {
    const createFn = async client => {
      const res = await client.query(
        "INSERT INTO cloud_category (name, status, tag) VALUES ($1, $2, $3) RETURNING id; ",
        [name, status, tag]
      );
      return {
        id: formateID("category", res.rows[0].id),
        status: true
      };
    };

    return excuteQuery(db)(createFn);
  },
  deleteCategory({ id }) {
    const deleteFn = async client => {
      const res = await client.query("DELETE FROM cloud_category WHERE id=$1", [
        decodeID(id)
      ]);
      return {
        id,
        status: true
      };
    };
    return excuteQuery(db)(deleteFn);
  },
  searchCategory({ tsQuery, tag , status }) {
    const searchFn = async client => {
      const conditionMap = [
        {
          condition: idx => `(name LIKE '%' || $${idx} || '%')`,
          val: tsQuery
        },
        {
          condition: idx => `tag = $${idx}`,
          val: tag
        },
        {
          condition: idx => `status = $${idx}`,
          val: status
        }
      ];

      const query = conditionMap.reduce(
        (a, b) => {
          return isValid(b.val)
            ? {
                sql: addCondition(a.sql, b.condition(a.payload.length + 1)),
                payload: [...a.payload, b.val]
              }
            : a;
        },
        {
          sql: "SELECT * FROM cloud_category",
          payload: []
        }
      );

      const res = await client.query(query.sql, query.payload);
      return res.rows.map(a => ({
        ...a,
        id: formateID("category", a.id)
      }));
    };

    return excuteQuery(db)(searchFn);
  }
});
