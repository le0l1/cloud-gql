// 生成 postgres 占位符
export const gPlaceholderForPostgres = length =>
  Array.from({ length })
    .map((_, i) => `$${i + 1}`)
    .join(",");

export const isValid = val => val !== null && val !== "" && val !== void 0;

// 添加sql 查询条件
export const addCondition = (sql, condition) => {
  const limitPart = sql.split("limit")[1];
  const queryPart = sql.split("limit")[0];
  if (/where/.test(queryPart)) { 
    return queryPart.split("where").join(`where ${condition} and`) + ' limit' + limitPart;
  }
  return `${queryPart} where ${condition}` + ' limit' + limitPart;
};
