import {
  gPlaceholderForPostgres,
  excuteQuery,
  isValid,
  withConditions,
  mergeIfValid
} from "../../helper/util";
import { formateID, decodeID } from "../../helper/id";

export const createShopModel = db => ({
  // 创建店铺
  createShop({ belongto, coreBusiness: core_business, ...shop }) {
    const createFn = async client => {
      const currentShop = mergeIfValid(
        {
          core_business,
          belongto: decodeID(belongto)
        },
        shop
      );

      const keys = Object.keys(currentShop);
      const res = await client.query(
        `INSERT INTO "cloud_shop" ( ${keys.join(",")})
VALUES (${gPlaceholderForPostgres(keys.length)})  RETURNING id;`,
        Object.values(currentShop)
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
  searchShop({ tsQuery, filter, limit = 10, offset = 0, isPassed, id }) {
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
          val: isPassed,
          condition: idx => `(is_passed = $${idx})`
        },
        {
          val: id ? decodeID(id) : null,
          condition: idx => `(id = $${idx})`
        }
      ];
      const query = withConditions(conditionMap, {
        sql:
          "SELECT  * , COUNT(*) OVER () as total FROM cloud_shop WHERE delete_at IS NULL LIMIT $1 OFFSET $2",
        payload: [limit, offset]
      });

      const res = await client.query(query.sql, query.payload);

      return res.rows.map(a => {
        return {
          ...a,
          id: formateID("shop", a.id)
        };
      });
    };

    return excuteQuery(db)(searchFn);
  },
  updateShop({
    id,
    isPassed: is_passed,
    coreBusiness: core_business,
    ...payload
  }) {
    const updateFn = async client => {
      const rest = mergeIfValid({ is_passed, core_business }, payload);
      const updateKeys = Object.keys(rest)
        .map((b, i) => {
          return `${b}=$${i + 1}`;
        })
        .join(",");

      let queryStr = `update cloud_shop set ${updateKeys} where id = $${Object.keys(
        rest
      ).length + 1} returning belongto`;

      let queryPayload = [...Object.values(rest), decodeID(id)];

      // 审核时应当同时改变对应的用户角色
      if (is_passed) {
        // user role
        const role = is_passed ? 2 : 1;
        queryStr = `
        with update_shop as (${queryStr})
        update cloud_user set role = $${queryPayload.length + 1} 
        where id = (select belongto from update_shop)
       `;
        queryPayload.push(role);
      }
      const res = await client.query(queryStr, queryPayload);
      return {
        id,
        status: true
      };
    };

    return excuteQuery(db)(updateFn);
  }
});
