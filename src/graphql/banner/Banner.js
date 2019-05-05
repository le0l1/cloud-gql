import { db } from "../../db";
import { gPlaceholderForPostgres } from "../../helper/util";
import { formateID, decodeID } from "../../helper/id";

export const createBannerModel = da => ({
  async addBanner(obj) {
    const client = await db.connect();
    try {
      const keys = Object.keys(obj);
      const res = await client.query(
        `INSERT INTO cloud_banner (${keys.join(
          ","
        )}) values (${gPlaceholderForPostgres(keys.length)}) RETURNING id`,
        Object.values(obj)
      );

      return {
        id: formateID("banner", res.rows[0].id),
        status: true
      };
    } finally {
      client.release();
    }
  },
  async deletBanner(id) {
    const client = await db.connect();
    try {
      const res = await client.query(`DELETE FROM cloud_banner WHERE id = $1`, [
        decodeID(id)
      ]);

      return {
        id,
        status: true
      };
    } finally {
      client.release();
    }
  },
  async findBannerByTag(tag) {
    const client = await db.connect();
    try {
      const res = await client.query(
        `SELECT * FROM cloud_banner WHERE tag=$1`,
        [tag]
      );
      return res.rows.map(({ id, ...rest }) => ({
        id: formateID("banner", id),
        ...rest
      }));
    } finally {
      client.release();
    }
  },
  async updateBanner(obj) {
    const client = await db.connect();
    try {
      const { id, ...rest } = obj;
      const keys = Object.keys(rest);
      const res = await client.query(
        `update cloud_banner set ${keys
          .map((k, i) => `${k}=$${i + 1}`)
          .join(",")} where id =$${keys.length + 1}
      `,
        [...Object.values(rest), decodeID(id)]
      );
      return {
        id,
        status: true
      };
    } finally {
      client.release();
    }
  }
});
