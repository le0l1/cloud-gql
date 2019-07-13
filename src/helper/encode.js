import { env } from './util';
import { TokenExpiredError } from './error';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(env('ENCRYPTION_KEY')), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(env('ENCRYPTION_KEY')), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

export const hashPassword = encrypt;

export const comparePassword = ({ pwd, hash, salt }) => {
  const password = decrypt(hash, salt);
  return pwd === password;
};

export const generateToken = payload => jwt.sign({ ...payload }, process.env.PRIVATE_TOKEN_KEY, {
  expiresIn: '1d',
});

export const tradeTokenForUser = token => jwt.verify(token, process.env.PRIVATE_TOKEN_KEY, (err) => {
  if (!err) return;
  if (err.name === 'TokenExpiredError') throw new TokenExpiredError();
});
