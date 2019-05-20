import { isValid } from "../util";

export class Sql {
  constructor(table) {
    this.table = table
  }
  of(table) {
    return new Sql(table)   
  }
  select(...args) {
    const params = args.length > 0 ? args.join(', ') : '*'
    this.sql = `select ${params} from ${this.table}`;
    return this;
  }
  with(alias, cb) {
    const newSql = Sql.of(this.table);
    this.sql = `with ${alias} as (${ cb(newSql) });`
    return this;
  },
  // {key, values}
  insert(...values, returnKey = 'id') {
    const validObj = Object.keys(values).reduce((a, b) => {
      return isValid(b) ? {...a, [b]: values[b]} : a;
    }, {})
    this.sql = `
      insert into ${this.table} (${validObj.join(' ,')})
      values ()
    `
  }
}