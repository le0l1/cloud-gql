import { getManager } from 'typeorm';
import { decodeNumberId, pipe } from '../../helper/util';
import {
  getQB,
  withPagination,
  leftJoinAndSelect,
  where,
  leftJoinAndMapOne,
} from '../../helper/sql';
import { BusinessCircle } from './businessCircle.entity';
import { User } from '../user/user.entity';
import { Image } from '../image/image.entity';
import { ReportStatus } from '../../helper/status';
import { BusinessCircleUser } from './businessCircleUser.entity';

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

  static searchBusinessCircles({
    offset, limit, reportStatus, userId,
  }) {
    let qb = pipe(
      getQB('businessCircle'),
      leftJoinAndSelect('businessCircle.user', 'user'),
      leftJoinAndSelect('businessCircle.images', 'images'),
      where('businessCircle.reportStatus = :reportStatus', { reportStatus }),
      withPagination(limit, offset),
    )(BusinessCircle);

    if (userId) {
      qb = pipe(
        leftJoinAndMapOne(
          'businessCircle.userStar',
          BusinessCircleUser,
          'businessCircleUser',
          'businessCircleUser.businessCircleId =  businessCircle.id and businessCircleUser.userId = :userId',
        ),
      )(qb);
    }
    return qb
      .setParameters({
        userId: decodeNumberId(userId),
      })
      .orderBy('businessCircle.createdAt', 'DESC').getManyAndCount();
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

  static starBusinessCircle({ id, userId }) {
    return getManager().transaction(async (trx) => {
      const businessCircle = await BusinessCircle.findOneOrFail(decodeNumberId(id));
      const user = await User.findOneOrFail(decodeNumberId(userId));
      const payload = {
        userId: user.id,
        businessCircleId: businessCircle.id,
      };
      const businessCircleUser = await BusinessCircleUser.findOne(payload);
      // 如果已点赞则取消点赞
      if (businessCircleUser) {
        await trx.remove(businessCircleUser);
        await trx.save(
          BusinessCircle.merge(businessCircle, {
            starCount: () => 'star_count - 1',
          }),
        );
      } else {
        await trx.insert(BusinessCircleUser, payload);
        await trx.save(
          BusinessCircle.merge(businessCircle, {
            starCount: () => 'star_count + 1',
          }),
        );
      }
      return businessCircle;
    });
  }

  static async reportBusinessCircle({ id }) {
    const businessCircle = await BusinessCircle.findOneOrFail(decodeNumberId(id));
    return BusinessCircle.merge(businessCircle, {
      reportStatus: ReportStatus.IS_REPORTED,
    }).save();
  }
}
