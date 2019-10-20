import { In, getManager } from 'typeorm';
import { decodeNumberId, pipe } from '../../helper/util';
import { Accessories } from '../accessories/accessories.entity';
import Quote from './quote.entity';
import logger from '../../helper/logger';
import { Image } from '../image/image.entity';
import {
  getQB, withPagination, getManyAndCount, where, setParameter, leftJoinAndMapMany, orderBy,
} from '../../helper/sql';
import { OfferStatus } from '../../helper/status';
import Offer from '../offer/offer.entity';
import { brodcastMessage } from '../../helper/umeng';

/**
 * 创建询价单
 */
export function createQuote(user, {
  accessoriesIds = [], images = [], ...rest
}) {
  return getManager().transaction(async (trx) => {
    const quote = await trx.save(Quote.create({
      userId: user.id,
      ...rest,
    }));
    logger.info('存储询价单配件');
    const accessories = await Accessories.findByIds(accessoriesIds.map(decodeNumberId));
    await trx.save(accessories.map(a => Accessories.merge(a, { quoteId: quote.id })));
    logger.info('存储询价单图片');
    const imageInstances = await images.map(path => Image.create({
      path,
      imageType: 'quote',
      imageTypeId: quote.id,
    }));
    await trx.save(imageInstances);
    brodcastMessage('pushvadio2.caf', '您有一条询价单信息!请注意查收');
    return quote;
  });
}
/**
 * 查询询价单列表
 */
export function searchQuotes(user, { limit, offset, status }) {
  const orm = pipe(
    getQB('quote'),
    withPagination(limit, offset),
    leftJoinAndMapMany(
      'quote.accessories',
      Accessories,
      'accssories',
      'accssories.quoteId = quote.id',
    ),
    leftJoinAndMapMany(
      'quote.images',
      Image,
      'image',
      "image.imageType = 'quote' and image.imageTypeId = quote.id",
    ),
    orderBy({
      'quote.createdAt': 'DESC',
    }),
  )(Quote);
  // 未报价
  if (status === OfferStatus.WAIT_OFFER) {
    const q = pipe(
      where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('offer.quoteId')
          .from(Offer, 'offer')
          .where('offer.userId = :userId')
          .andWhere('offer.quoteId = quote.id')
          .getQuery();
        return `NOT EXISTS ${subQuery}`;
      }),
      setParameter('userId', user.id),
    )(orm);
    return getManyAndCount(q);
  }
  // 已报价
  if (status === OfferStatus.HAS_OFFERED) {
    return pipe(
      where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('offer.quoteId', 'quote_id')
          .from(Offer, 'offer')
          .where('offer.userId = :userId')
          .andWhere('offer.quoteId = quote.id')
          .getQuery();
        return `EXISTS ${subQuery}`;
      }),
      setParameter('userId', user.id),
      getManyAndCount,
    )(orm);
  }
  // 未参与
  if (status === OfferStatus.NOT_PARTICIPATING) {
    return pipe(
      where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('offer.quoteId')
          .from(Offer, 'offer')
          .where('offer.userId != :userId')
          .andWhere('offer.quoteId = quote.id')
          .andWhere('offer.isAcceptance = true')
          .getQuery();
        return `EXISTS ${subQuery}`;
      }),
      setParameter('userId', user.id),
      getManyAndCount,
    )(orm);
  }

  return orm.getManyAndCount();
}
/**
 * 查询询价单详情
 */
export function searchQuote(id) {
  return pipe(
    getQB('quote'),
    leftJoinAndMapMany(
      'quote.accessories',
      Accessories,
      'accssories',
      'accssories.quoteId = quote.id',
    ),
    leftJoinAndMapMany(
      'quote.images',
      Image,
      'image',
      "image.imageType = 'quote' and image.imageTypeId = quote.id",
    ),
    where('quote.id = :id', { id: decodeNumberId(id) }),
    getManyAndCount,
  )(Quote);
}

/**
 * 查询用户询价单
 */
export function searchCustomerQuotes(user) {
  return pipe(
    getQB('quote'),
    leftJoinAndMapMany(
      'quote.accessories',
      Accessories,
      'accssories',
      'accssories.quoteId = quote.id',
    ),
    leftJoinAndMapMany(
      'quote.images',
      Image,
      'image',
      "image.imageType = 'quote' and image.imageTypeId = quote.id",
    ),
    where('quote.userId = :userId', { userId: user.id }),
    orderBy({
      'quote.createdAt': 'DESC',
    }),
    getManyAndCount,
  )(Quote);
}
