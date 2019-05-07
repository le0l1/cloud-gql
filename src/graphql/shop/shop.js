import {
  gPlaceholderForPostgres,
  excuteQuery,
  isValid,
  withConditions
} from "../../helper/util";
import { formateID, decodeID } from "../../helper/id";

export const createShopModel = db => ({
  // 创建店铺
  createShop({ name, qqchat, wechat, phone, description, belongto }) {
    const createFn = async client => {
      const res = await client.query(
        `INSERT INTO "cloud_shop" ( "name", "qqchat", "wechat", "phone", "description", "belongto")
VALUES (${gPlaceholderForPostgres(6)})  RETURNING id;`,
        [name, qqchat, wechat, phone, description, decodeID(belongto)]
      );

      return {
        id: formateID("shop", res.rows[0].id),
        status: true
      };
    };

    return excuteQuery(db)(createFn);
  },
  // 删除店铺
  deleteShop({ id }) {
    const deleteFn = async client => {
      const res = await client.query(
        `UPDATE cloud_shop SET delete_at = $1 WHERE id = $2;`,
        [new Date(), decodeID(id)]
      );
      return {
        id: id,
        status: true
      };
    };

    return excuteQuery(db)(deleteFn);
  },
  // 查询店铺
  searchShop({ tsQuery, filter, first = 10, after }) {
    const searchFn = async client => {
      const conditionMap = [
        {
          val: tsQuery,
          condition: idx =>
            `(name like '%' || $${idx} || '%' or phone like '%' || $${idx} || '%')`
        },
        {
          val: filter ? filter.status : null,
          condition: idx => `(status = $${idx})`
        },
        {
          val: after ? decodeID(after) : null,
          condition: idx => `(created_at::timestamp(0) > $${idx}::timestamp(0))`
        }
      ];
      const query = withConditions(conditionMap, {
        sql:
          "SELECT *, COUNT(*) OVER () as total FROM cloud_shop WHERE delete_at IS NULL LIMIT $1",
        payload: [first]
      });
      console.log(query.sql)
      const res = await client.query(query.sql, query.payload);
      
      return res.rows.map(a => {
        console.log(a.created_at)
        return {
          cursor: formateID("created_at", a.created_at.toJSON()),
          node: {
            ...a,
            id: formateID("shop", a.id)
          }
        };
      });
    };

    return excuteQuery(db)(searchFn);
  }
});
