import { db } from "../../db";

export const applyAuthRoute = router => {
  router.post("/token", async (ctx, next) => {
    ctx.verifyParams({
      username: "string",
      password: "string"
    });

    const { username, password } = ctx.request.body;
    const client = await db.connect();
    try {
      const res = await client.query(
        "SELECT id, name, phone, password, created_at FROM users WHERE name = $1",
        [username]
      );
      if (!res.rows[0]) {
        throw new Error("No such users");
      }

      const { password: realpassword, ...rest } = res.rows[0];
      if (password === realpassword) {
        ctx.body = rest;
      } else {
        throw new Error("Password is not valid");
      }
    } finally {
      client.release();
    }
  });
};
