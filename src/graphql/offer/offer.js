import { getManager } from 'typeorm';
import Quote from '../quote/quote.entity';
import { decodeNumberId } from '../../helper/util';
import Offer from './offer.entity';

/**
 * 创建报价
 */
export async function createOffer(user, { quoteId, offerPrice }) {
  const quote = await Quote.findOneOrFail(decodeNumberId(quoteId));
  return Offer.save({
    quoteId: quote.id,
    userId: user.id,
    offerPrice,
  });
}
/**
 * 采纳报价
 */
export function accpetOffer(user, { offerId }) {
  return getManager().transaction(async (trx) => {
    const offer = await Offer.findOneOrFail(decodeNumberId(offerId));
    await trx.save(Offer.merge(offer, { isAcceptance: true }));
    await trx.update(Quote, { id: offer.quoteId, offerId: null }, { offerId: offer.id });
    // TODO: 还需要创建出对应的订单
    return offer;
  });
}
