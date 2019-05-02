// 生成 postgres 占位符
export const gPlaceholderForPostgres = length =>
  Array.from({ length })
    .map((_, i) => `$${i + 1}`)
    .join(",");
