import { pipe } from "./database/sql";
import { isValid, prop } from "./util";

// base64 id
export const formateID = (type, id) => {
  return Buffer.from(`${type}/${id}`, "binary").toString("base64");
};

// decode id
export const decodeID = str => decodeIDAndType(str)[1];

export const decodeIDAndType = str => {
  return str
    ? Buffer.from(str, "base64")
      .toString("binary")
      .split("/")
    : [null, null];
}

// decode Id and transform to type Number
export const decodeNumberId = pipe(
  decodeID,
  Number
);
