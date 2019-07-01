import { isValid, prop } from './util';

export const addIfValid = cb => (val, orm) => (isValid(val) ? cb(val, orm) : val);
export const withLimit = addIfValid((val, orm) => orm.limit(val));
export const where = (sql, val) => (orm) => {
  if (val) {
    return isValid(Object.values(val)[0]) ? orm.andWhere(sql, val) : orm;
  }
  return orm.andWhere(sql);
};
export const getQB = alias => orm => orm.createQueryBuilder(alias);
export const getMany = orm => orm.getMany();
export const getOne = orm => orm.getOne();
export const getManyAndCount = query => query.getManyAndCount();
export const withPagination = (limit = 8, offset = 1) => (query) => {
  const skip = Math.max(0, offset - 1) * limit;
  return query.take(limit).skip(skip);
};
export const leftJoinAndSelect = (property, entity) => orm => orm.leftJoinAndSelect(prop, entity);
