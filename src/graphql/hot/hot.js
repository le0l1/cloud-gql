import { Hot } from './hot.entity';

export default class HotResolver {
  static async storeHot({ route, ...rest }) {
    const hot = await Hot.findOne({ route });
    return hot ? Hot.merge(hot, rest).save() : Hot.save({
      route,
      ...rest,
    });
  }

  static searchHot(route) {
    return Hot.findOne({
      route,
    });
  }
}
