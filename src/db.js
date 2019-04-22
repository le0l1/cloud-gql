import { Pool } from "pg";

// pg pool
export const db = new Pool();

db.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
