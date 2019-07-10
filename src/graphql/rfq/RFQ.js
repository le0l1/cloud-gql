import { getManager, In } from 'typeorm';
import { User } from '../user/user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { RFQ } from './RFQ.entity';
import { Accessories } from '../accessories/accessories.entity';
import { Banner } from '../banner/banner.entity';
import { withPagination, getManyAndCount, where } from '../../helper/sql';

export default class RFQResolver {
  static async createRFQ({
    announcerId, vechicleAccessories: accessoriesIds, RFQImages, ...rest
  }) {
    return getManager().transaction(async (trx) => {
      const user = await User.findOneOrFail(decodeNumberId(announcerId));
      const rfq = RFQ.create({
        announcerId: user.id,
        RFQCover: RFQImages[0] || null,
        ...rest,
      });
      await trx.save(rfq);
      const accessories = await Promise.all(
        accessoriesIds.map(async (a) => {
          const instance = await Accessories.findOneOrFail(decodeNumberId(a));
          instance.rfqId = rfq.id;
          return instance;
        }),
      );
      await trx.save(accessories);
      const banners = RFQImages.map(path => Banner.create({
        path,
        rfq,
      }));
      await trx.save(banners);
      return rfq;
    });
  }

  static searchRFQs({ limit, offset }) {
    const qb = RFQ.createQueryBuilder('RFQ')
      .leftJoinAndMapOne('RFQ.announcer', User, 'user', 'user.id = RFQ.announcerId')
      .leftJoinAndMapMany(
        'RFQ.vechicleAccessories',
        Accessories,
        'accessories',
        'accessories.rfqId = RFQ.id',
      );

    return pipe(
      withPagination(limit, offset),
      getManyAndCount,
    )(qb);
  }

  static deleteRFQ({ id }) {
    return getManager().transaction(async (trx) => {
      const rfq = await RFQ.findOneOrFail(decodeNumberId(id));
      const accessories = await Accessories.find({
        rfqId: rfq.id,
      });
      const accessoriesIds = accessories.map(a => a.id);
      const qb = trx
        .createQueryBuilder()
        .delete()
        .from(Banner)
        .orWhere('rfq = :rfq', { rfq: rfq.id })
      const execute = orm => orm.execute();
      await pipe(
        where('accessories in (:...accessories)', {
          accessories: accessoriesIds.length ? accessoriesIds : null,
        }),
        execute,
      )(qb);
      await trx.remove(accessories);
      await trx.remove(rfq);
      return { id: decodeNumberId(id) };
    });
  }
}
