import { getManager } from 'typeorm';
import { decodeNumberId, pipe } from '../../helper/util';
import {
  getQB, withPagination, leftJoinAndSelect, getManyAndCount,
} from '../../helper/sql';
import { BusinessCircle } from './businessCircle.entity';
import { User } from '../user/user.entity';
import { Image } from '../image/image.entity';

export default class BusinessCircleResolver {
  static createBusinessCircle({ userId, images, content }) {
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

  static searchBusinessCircles({ offset, limit }) {
    return pipe(
      getQB('businessCircle'),
      leftJoinAndSelect('businessCircle.user', 'user'),
      leftJoinAndSelect('businessCircle.images', 'images'),
      withPagination(limit, offset),
      getManyAndCount,
    )(BusinessCircle);
  }

  static deleteBusinessCircles({ id }) {
    const realId = decodeNumberId(id);
    return BusinessCircle.delete(realId).then(() => ({
      id: realId,
    }));
  }
}
