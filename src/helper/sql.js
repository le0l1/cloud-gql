import { isValid, prop } from './util';

export const addIfValid = cb => (val, orm) => (isValid(val) ? cb(val, orm) : val);
export const withLimit = addIfValid((val, orm) => orm.limit(val));
export const where = (sql, val) => orm => (isValid(Object.values(val)[0]) ? orm.andWhere(sql, val) : orm);
export const getQB = alias => orm => orm.createQueryBuilder(alias);
export const getMany = orm => orm.getMany();
export const getOne = orm => orm.getOne();
export const getManyAndCount = query => query.getManyAndCount();
export const withPagination = (limit = 8, offset = 1) => query => query.take(limit).skip(Math.min(0, offset - 1));
export const leftJoinAndSelect = (property, entity) => orm => orm.leftJoinAndSelect(prop, entity);
