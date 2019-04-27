const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const createSalt = () => crypto.randomBytes(256).toString("base64");

const hashTo = ({ pwd, salt }) => {
  const hmac = crypto.createHmac("sha256", salt);
  return hmac.update(pwd).digest("hex");
};

export const hashPassword = pwd => {
  const salt = createSalt();
  return {
    hashed: hashTo({ pwd, salt }),
    salt
  };
};

export const comparePassword = ({ pwd, hash, salt }) => {
  return hashTo({ pwd, salt }) === hash;
};

export const generateToken = payload =>
  jwt.sign(payload, process.env.PRIVATE_TOKEN_KEY, {
    expiresIn: "1d"
  });

export const tradeTokenForUser = token =>
  jwt.verify(token, process.env.PRIVATE_TOKEN_KEY);
