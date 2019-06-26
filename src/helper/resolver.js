import { formateID } from './util';

export const connectionResolver = {
  edges(v) {
    return v[0];
  },
  pageInfo(v) {
    return v;
  },
};

export const idResolver = type => ({
  id(v) {
    return v.id ? formateID(type, v.id) : null;
  },
});
