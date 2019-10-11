import { getManager } from 'typeorm';
import Offer from '../graphql/offer/offer.entity';
import { Payment } from '../graphql/payment/payment.entity';
import { PaymentStatus } from '../helper/status';
import { User } from '../graphql/user/user.entity';
import logger from '../helper/logger';
import OfferRecord from '../graphql/offer/offerRecord.entity';

function completeOffer(offerRecord) {
  const { userId } = offerRecord.offer;
  const totalFee = offerRecord.offer.offerPrice;
  const time = 1;

  const doComplete = () => getManager().transaction(async (trx) => {
    const user = await User.findOne(userId);
    const oldVersion = user.version;
    user.totalFee = Number(user.totalFee) + Number(totalFee);
    await trx.save(user);
    await trx.update(OfferRecord, {
      id: offerRecord.id,
      isCompleted: false,
    }, { isCompleted: true });
    if (user.version !== (oldVersion + 1)) {
      throw new Error();
    }
  }).catch(() => {
    logger.warn(`询价单${offerRecord.orderNumber}更新用户余额失败!尝试第${time},`);
    if (time < 3) {
      return doComplete(time + 1);
    }
    logger.warn(`询价单${offerRecord.orderNumber}更新用户余额失败!自动尝试超过最大次数`);
    return {};
  });
  return doComplete(time);
}

export default async function () {
  const offerRecords = await OfferRecord
    .createQueryBuilder('offerRecord')
    .leftJoinAndMapOne('offerRecord.payment', Payment, 'payment', 'payment.id = offerRecord.paymentId')
    .leftJoinAndMapOne('offerRecord.offer', Offer, 'offer', 'offer.id = offerRecord.offerId')
    .where('payment.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAID })
    .andWhere('offerRecord.isCompleted = false')
    .getMany();
  await Promise.all(offerRecords.map(completeOffer));
}
