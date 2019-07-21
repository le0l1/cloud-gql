import { Hot } from './hot.entity';
import { decodeNumberId } from '../../helper/util';

export default class HotResolver {
  static createHot(params) {
    return Hot.save(params);
  }

  static async updateHot({ id, ...rest }) {
    const hot = await Hot.findOneOrFail(decodeNumberId(id));
    return Hot.merge(hot, rest).save();
  }

  static searchHot(route) {
    return Hot.findOne({
      route,
    });
  }
}
