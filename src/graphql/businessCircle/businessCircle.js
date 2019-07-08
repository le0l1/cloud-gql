import { getManager } from 'typeorm';
import { decodeNumberId, pipe } from '../../helper/util';
import {
  getQB, withPagination, leftJoinAndSelect, getManyAndCount, where,
} from '../../helper/sql';
import { BusinessCircle } from './businessCircle.entity';
import { User } from '../user/user.entity';
import { Image } from '../image/image.entity';
import { ReportStatus } from '../../helper/status';

export default class BusinessCircleResolver {
  static createBusinessCircle({ userId, images = [], content }) {
    return getManager().transaction(async (trx) => {
      const user = await User.findOneOrFail(decodeNumberId(userId));
      let businessCircle = BusinessCircle.create({
        user,
        content,
      });
      businessCircle = await trx.save(businessCircle);
      const imageEntities = images.map(a => Image.create({
        path: a,
        businessCircle,
      }));
      await trx.save(imageEntities);
      return businessCircle;
    });
  }

  static searchBusinessCircles({ offset, limit, reportStatus }) {
    const qb = pipe(
      getQB('businessCircle'),
      leftJoinAndSelect('businessCircle.user', 'user'),
      leftJoinAndSelect('businessCircle.images', 'images'),
      where('businessCircle.reportStatus = :reportStatus', { reportStatus }),
      withPagination(limit, offset),
    )(BusinessCircle);
    return qb.orderBy('businessCircle.createdAt', 'DESC')
      .getManyAndCount();
  }

  static deleteBusinessCircles({ id }) {
    return getManager().transaction(async (trx) => {
      const realId = decodeNumberId(id);
      const businessCircle = await BusinessCircle.findOneOrFail(realId);
      const images = await Image.find({
        businessCircle,
      });
      await trx.remove(images);
      await trx.remove(businessCircle);
      return { id: realId };
    });
  }

  static async starBusinessCircle({ id }) {
    const businessCircle = await BusinessCircle.findOneOrFail(decodeNumberId(id));
    return BusinessCircle.merge(businessCircle, {
      starCount: () => 'star_count + 1',
    }).save();
  }

  static async reportBusinessCircle({ id }) {
    const businessCircle = await BusinessCircle.findOneOrFail(decodeNumberId(id));
    return BusinessCircle.merge(businessCircle, {
      reportStatus: ReportStatus.IS_REPORTED,
    }).save();
  }
}
