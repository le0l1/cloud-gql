import { isValid } from "../util";

export const addIfValid = cb => (val, orm) =>
  isValid(val) ? cb(val, orm) : val;

export const limit = addIfValid((val, orm) => orm.limit(val));

export const pipe = (...fns) => val => fns.reduce((a, b) => b(a), val);
export const where = (sql, val) => orm => {
  return isValid(Object.values(val)[0]) ? orm.andWhere(sql, val) : orm;
};

export const getQB = alias => orm => orm.createQueryBuilder(alias);
export const getMany = orm => orm.getMany();
