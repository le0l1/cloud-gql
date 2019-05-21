// base64 id
export const formateID = (type, id) => {
  return Buffer.from(`${type}/${id}`, "binary").toString("base64");
};

// decode id
export const decodeID = str => {
  return str
    ? Buffer.from(str, "base64")
        .toString("binary")
        .split("/")[1]
    : "";
};
