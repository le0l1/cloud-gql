import { formateID, decodeID } from "../../helper/id";
import { excuteQuery, isValid, withConditions } from "../../helper/util";

export const createCategoryModel = db => ({
  createCategory({ name, status, tag, parentId = null, route, image }) {
    const createFn = async client => {
      // ignore route when the category not on the first level
      if (parentId) route = null;
      const res = await client.query(
        "INSERT INTO cloud_category (name, status, tag, route, image, parent_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id; ",
        [
          name,
          status,
          tag,
          route,
          image,
          parentId ? decodeID(parentId) : parentId
        ]
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
  searchCategory({ route, id }) {
    const searchFn = async client => {
      const payloads = [route, id];
      const equal = (key, val) => idx => (val ? `${key} = $${idx}` : null);

      const whereCondition = [equal("route", route), equal("id", id)]
        .map((a, i) => a(i + 1))
        .filter(isValid);

      const mergeWhereCondition = v => "where " + v.join(" and");

      const queryStr = `
        with RECURSIVE cte as (
          select   * from cloud_category  ${mergeWhereCondition(whereCondition)}
          union
          select  c.* from cloud_category c join cte t on c.parent_id = t.id 
         )
         select * from cte;
        `;

      console.log(queryStr);

      const res = await client.query(queryStr, payloads.filter(isValid));

      const flatParent = (arr, a) =>
        arr.map(b => {
          if (a.parent_id === b.id) {
            return {
              ...b,
              children: b.children ? [...b.children, a] : [a]
            };
          }

          if (b.children) {
            return {
              ...b,
              children: flatParent(b.children, a)
            };
          }

          return b;
        });

      const formateCatID = formateID.bind("", "category");

      const flatResult = arr =>
        arr.reduce((a, b) => {
          b.id = formateCatID(b.id);
          b.parent_id = b.parent_id ? formateCatID(b.parent_id) : null;
          return !b.parent_id ? [...a, b] : flatParent(a, b);
        }, []);

      return flatResult(res.rows);
    };

    return excuteQuery(db)(searchFn);
  },
  // update category
  updateCategory({ id, ...rest }) {
    const updateFn = async client => {
      const updateKeys = Object.keys(rest)
        .map((b, i) => {
          return `${b}=$${i + 1}`;
        })
        .join(",");
      const queryStr = `update cloud_category set ${updateKeys} where id = $${Object.keys(
        rest
      ).length + 1}`;
      const res = await client.query(queryStr, [
        ...Object.values(rest),
        decodeID(id)
      ]);
      return {
        id,
        status: true
      };
    };

    return excuteQuery(db)(updateFn);
  }
});
