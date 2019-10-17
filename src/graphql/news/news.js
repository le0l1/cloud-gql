import { News } from './news.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { getQB, withPagination, getManyAndCount } from '../../helper/sql';

export default class NewsResolver {
  static createNews(params) {
    return News.save(params);
  }

  static deleteNews({ id }) {
    const realId = decodeNumberId(id);
    return News.delete(realId).then(() => ({
      id: realId,
    }));
  }

  static searchNews({ limit, offset }) {
    return pipe(
      getQB('news'),
      withPagination(limit, offset),
      getManyAndCount,
    )(News);
  }

  static async updateNews({ id, ...rest }) {
    const news = await News.findOneOrFail(decodeNumberId(id));
    return News.merge(news, rest).save();
  }

  static searchNewsDetail(id) {
    return News.findOneOrFail({
      id: decodeNumberId(id),
    });
  }
}
