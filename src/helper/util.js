export const isValid = val => val !== null && val !== '' && val !== undefined;
// 生成随机验证码
export const generateSMSCode = () => Math.floor(100000000 + Math.random() * 900000000);

// 合并多个属性到对象
export const mergeIfValid = (obj, target) => Object.keys(obj).reduce((a, b) => {
  if (isValid(obj[b])) {
    a[b] = obj[b];
  }
  return a;
}, target);


// transform entities to tree struct
export const flatEntitiesTree = (entities, relationMap, chidKey = 'specs') => {
  const findParent = node => relationMap.find(({ id }) => id === node.id).parent;
  const flatFn = (arr, child) => arr.forEach((item) => {
    if (findParent(child) === item.id) {
      item[chidKey] = item[chidKey] ? [...item[chidKey], child] : [child];
    } else if (item[chidKey]) {
      flatFn(item[chidKey], child);
    }
  });
  return entities.reduce((a, b) => {
    if (findParent(b) === null) {
      a.push(b);
    } else {
      flatFn(a, b);
    }
    return a;
  }, []);
};

export const prop = key => obj => obj[key];
export const pipe = (...fns) => val => fns.reduce((a, b) => b(a), val);
export const formateID = (type, id) => Buffer.from(`${type}/${id}`, 'binary').toString('base64');
export const decodeTypeAndId = str => (str
  ? Buffer.from(str, 'base64')
    .toString('binary')
    .split('/')
  : [null, null]);

export const decodeID = str => decodeTypeAndId(str)[1];

export const decodeNumberId = pipe(
  decodeID,
  Number,
);


export const handleSuccessResult = (type, id) => ({
  id: formateID(type, id),
  status: true,
});

export const setIfValid = (key, fomate) => payload => (payload[key]
  ? {
    ...payload,
    [key]: fomate(payload[key]),
  }
  : payload);

export const isEmpty = arg => arg === '' || Object.keys(arg).length === 0;

export const env = k => process.env[k];

export const mapObjectArr = obj => Object.keys(obj).reduce((a, b) => ({
  ...a,
  [b]: obj[b][0],
}), {});

export const select = (conditions, def) => (payload) => {
  let index = 0;
  while (index < conditions.length) {
    const condition = conditions[index];
    if (condition[0](payload)) {
      return condition[1](payload);
    }
    index += 1;
  }
  return def;
};
