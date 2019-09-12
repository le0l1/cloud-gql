import { getManager, In } from 'typeorm';
import { User } from '../user/user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { RFQ } from './RFQ.entity';
import { Accessories } from '../accessories/accessories.entity';
import { Banner } from '../banner/banner.entity';
import {
  withPagination, getManyAndCount, where, orderBy,
} from '../../helper/sql';
import { Shop } from '../shop/shop.entity';
import { Device } from '../device/Device.entity';
import { brodcastMessage } from '../../helper/umeng';
import logger from '../../helper/logger';

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
      RFQResolver.publishMessage(rfq);
      return rfq;
    });
  }

  static searchRFQs({ limit, offset, sort = 'DESC' }) {
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
      orderBy({
        'RFQ.announceAt': sort,
      }),
      getManyAndCount,
    )(qb);
  }

  static async searchRFQ(id) {
    return RFQ.createQueryBuilder('RFQ')
      .leftJoinAndMapOne('RFQ.announcer', User, 'user', 'user.id = RFQ.announcerId')
      .leftJoinAndMapMany(
        'RFQ.vechicleAccessories',
        Accessories,
        'accessories',
        'accessories.rfqId = RFQ.id',
      )
      .where('RFQ.id = :rfqId', { rfqId: decodeNumberId(id) })
      .getOne();
  }

  static deleteRFQ({ id }) {
    return getManager().transaction(async (trx) => {
      const rfq = await RFQ.findOneOrFail(decodeNumberId(id));
      const accessories = await Accessories.find({
        rfqId: rfq.id,
      });
      const accessoriesIds = accessories.map(a => a.id);
      const banners = await Banner.createQueryBuilder('banner')
        .where('banner.accessories in (:...accessoriesIds)', { accessoriesIds })
        .orWhere('banner.rfq = :rfq', { rfq: rfq.id })
        .getMany();
      const qb = trx
        .createQueryBuilder()
        .delete()
        .from(Banner)
        .orWhere('rfq = :rfq', { rfq: rfq.id });
      const execute = orm => orm.execute();
      await pipe(
        where('accessories in (:...accessories)', {
          accessories: accessoriesIds.length ? accessoriesIds : null,
        }),
        execute,
      )(qb);
      await trx.remove(banners);
      await trx.remove(accessories);
      await trx.remove(rfq);
      return { id: decodeNumberId(id) };
    });
  }

  static async publishMessage(rfq) {
    const shopQb = await Shop.createQueryBuilder('shop')
      .leftJoinAndSelect('shop.categories', 'category')
      .where('category.name like :tsQuery')
      .select('shop."userId"');

    const merchants = await User.createQueryBuilder('user')
      .where(`user.id IN (${shopQb.getQuery()})`)
      .select(['user.id'])
      .setParameter('tsQuery', `%${rfq.vehicleSeries}%`)
      .getMany();
    if (merchants.length) {
      console.log('broadcast merchants:', merchants);
      const devices = await Device.find({
        select: ['deviceToken'],
        where: {
          userId: In(merchants.map(m => m.id)),
        },
      });
      console.log('broadcast devices:', devices);
      if (devices.length) {
        brodcastMessage(devices.map(d => d.deviceToken), '您有一条新的询价单消息');
      } else {
        logger.warn('推送取消: 无匹配商家设备');
      }
    } else {
      logger.warn('推送取消: 无匹配商家');
    }
  }
}
