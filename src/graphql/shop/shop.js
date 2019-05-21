import {
  gPlaceholderForPostgres,
  excuteQuery,
  isValid,
  withConditions,
  mergeIfValid
} from "../../helper/util";
import { formateID, decodeID } from "../../helper/id";
import { Shop } from "./shop.entity";
import { where, pipe, getMany, getQB } from "../../helper/database/sql";
import { Category } from "../category/category.entity";

const getCategories = arr =>
  arr.map(a => {
    const cate = new Category();
    cate.id = decodeID(a);
    return cate;
  });

export const createShopModel = db => ({
  // 创建店铺
  async createShop({ belongto, coreBusiness = [], ...rest }) {
    console.log(coreBusiness)
    const currentShop = Shop.create({
      belongto: decodeID(belongto),
      coreBusiness: getCategories(coreBusiness),
      ...rest
    });
    const { id } = await currentShop.save();
    return {
      id: formateID("shop", id),
      status: true
    };
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
  searchShop({
    tsQuery,
    filter = { status: null },
    limit = 10,
    offset = 0,
    isPassed,
    id
  }) {
    const queryBuilder = Shop.createQueryBuilder("shop");
    const formateResID = async query => {
      const res = await query;
      return res.map(a => ({
        ...a,
        id: formateID
      }));
    };

    return pipe(
      getQB("shop"),
      where("(shop.name like :tsQuery or shop.phone like :tsQuery)", {
        tsQuery: tsQuery ? `%${tsQuery}%` : null
      }),
      where("shop.status = :status", { status: filter.status }),
      where("shop.is_passed = :isPassed", { isPassed }),
      where("shop.id =:id", { id }),
      getMany,
      formateResID
    )(Shop);
  },
  async updateShop({ id, isPassed, coreBusiness, ...payload }) {
    await Shop.update(
      { id: decodeID(id) },
      {
        coreBuisness: getCategories(coreBusiness),
        isPassed,
        ...payload
      }
    );
    return {
      id,
      status: true
    };

    // const updateFn = async client => {
    //   const rest = mergeIfValid({ is_passed, core_business }, payload);
    //   const updateKeys = Object.keys(rest)
    //     .map((b, i) => {
    //       return `${b}=$${i + 1}`;
    //     })
    //     .join(",");

    //   let queryStr = `update cloud_shop set ${updateKeys} where id = $${Object.keys(
    //     rest
    //   ).length + 1} returning belongto`;

    //   let queryPayload = [...Object.values(rest), decodeID(id)];

    //   // 审核时应当同时改变对应的用户角色
    //   if (is_passed) {
    //     // user role
    //     const role = is_passed ? 2 : 1;
    //     queryStr = `
    //     with update_shop as (${queryStr})
    //     update cloud_user set role = $${queryPayload.length + 1}
    //     where id = (select belongto from update_shop)
    //    `;
    //     queryPayload.push(role);
    //   }
    //   const res = await client.query(queryStr, queryPayload);
    //   return {
    //     id,
    //     status: true
    //   };
    // };

    // return excuteQuery(db)(updateFn);
  },

  createShopBanner(id, shopBanner) {}
});
