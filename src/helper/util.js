// 生成 postgres 占位符
export const gPlaceholderForPostgres = length =>
  Array.from({ length })
    .map((_, i) => `$${i + 1}`)
    .join(",");

export const isValid = val => val !== null && val !== "" && val !== void 0;

// 添加sql 查询条件
export const addCondition = (sql, condition) => {
  const limitPart = sql.split(/limit/i)[1];
  const queryPart = sql.split(/limit/i)[0];
  let query = "";

  if (/where/i.test(queryPart)) {
    query = queryPart.split(/where/i).join(`where ${condition} and`);
  } else {
    query = `${queryPart} where ${condition}`;
  }

  return limitPart ? query + " limit" + limitPart : query;
};

// 回调执行sql
export const excuteQuery = db => async cb => {
  const client = await db.connect();
  try {
    return cb(client);
  } finally {
    client.release();
  }
};

//  condition arr
export const withConditions = (conditions, defaultQuery) => {
  return conditions.reduce((a, b) => {
    return isValid(b.val)
      ? {
          sql: addCondition(a.sql, b.condition(a.payload.length + 1)),
          payload: [...a.payload, b.val]
        }
      : a;
  }, defaultQuery);
};

// 生成随机验证码
export const generateSMSCode = () => {
  return parseInt(Math.random() * 1000000);
};

// 合并多个属性到对象
export const mergeIfValid = (obj, target) =>
  Object.keys(obj).reduce((a, b) => {
    if (isValid(obj[b])) {
      a[b] = obj[b];
    }
    return a;
  }, target);

// map alias
export const mapAlias = (rules, obj) => {
  return Object.keys(obj).reduce((a, b) => {}, a);
};
