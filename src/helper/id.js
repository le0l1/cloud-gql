// base64 id
export const formateID = (type, id) =>
  Buffer.from(`${type}/${id}`).toString("base64");

// decode id
export const decodeID = str =>
  Buffer.from(str, "base64")
    .toString("utf-8")
    .split("/")[1];
