import { getManager } from 'typeorm';
import Quote from '../quote/quote.entity';
import {
  decodeNumberId, pipe, makeOfferNumber,
} from '../../helper/util';
import Offer from './offer.entity';
import { Image } from '../image/image.entity';
import {
  getQB, leftJoinAndMapMany, leftJoinAndMapOne, where, getMany, getOne,
} from '../../helper/sql';
import { Shop } from '../shop/shop.entity';
import OfferRecord from './offerRecord.entity';
import { Payment } from '../payment/payment.entity';
import { createPay } from '../payment/pay';
import { PaymentOrder } from '../../payment/paymentOrder.entity';
import { PaymentOrderType } from '../../helper/status';

/**
 * 创建报价
 */
export function createOffer(user, { quoteId, images = [], ...rest }) {
  return getManager().transaction(async (trx) => {
    const quote = await Quote.findOneOrFail(decodeNumberId(quoteId));
    const oldOffer = await Offer.findOne({
      userId: user.id,
      quoteId: quote.id,
    });

    const offer = await trx.save(!oldOffer
      ? Offer.create({
        quoteId: quote.id,
        userId: user.id,
        ...rest,
      })
      : Offer.merge(oldOffer, rest));

    await trx.save(images.map(path => Image.create({
      path,
      imageType: 'offer',
      imageTypeId: offer.id,
    })));
    return offer;
  });
}
/**
 * 采纳报价
 */
export function accpetOffer(user, { offerId, paymentMethod }) {
  return getManager().transaction(async (trx) => {
    const offer = await Offer.findOneOrFail(decodeNumberId(offerId));
    await trx.save(Offer.merge(offer, { isAcceptance: true }));
    await trx.update(Quote, { id: offer.quoteId, offerId: null }, { offerId: offer.id });

    const payment = Payment.create({
      totalFee: offer.offerPrice,
      paymentMethod,
    });
    await trx.save(payment);

    const offerRecord = OfferRecord.create({
      orderNumber: makeOfferNumber(),
      paymentId: payment.id,
      offerId: offer.id,
    });
    await trx.save(offerRecord);

    await trx.save(PaymentOrder, {
      paymentId: payment.id,
      orderType: PaymentOrderType.offer,
      orderTypeId: offerRecord.id,
      orderNumber: offerRecord.orderNumber,
    });

    return createPay(paymentMethod)
      .setOrderNumber(offer.orderNumber)
      .setTotalFee()
      .preparePayment();
  });
}
/**
 * 报价列表
 */
export function getOffers(quoteId) {
  return pipe(
    getQB('offer'),
    leftJoinAndMapOne('offer.shop', Shop, 'shop', 'shop.user_id = offer.userId'),
    leftJoinAndMapMany('offer.images', Image, 'image', "image.imageType = 'offer' and image.imageTypeId = offer.id"),
    where('offer.quoteId = :quoteId', { quoteId: decodeNumberId(quoteId) }),
    getMany,
  )(Offer);
}
/**
 * 报价详情
 */
export function getOffer(id) {
  return pipe(
    getQB('offer'),
    leftJoinAndMapOne('offer.shop', Shop, 'shop', 'shop.belongto = offer.userId'),
    leftJoinAndMapMany('offer.images', Image, 'image', "image.imageType = 'offer' and image.imageTypeId = offer.id"),
    where('offer.id = :id', { id: decodeNumberId(id) }),
    getOne,
  )(Offer);
}
