import {
  leftJoinAndMapOne, getQB, getOne, where,
} from '../../helper/sql';
import { PaymentStatus } from '../../helper/status';
import { pipe } from '../../helper/util';
import { Payment } from '../payment/payment.entity';
import Offer from './offer.entity';
import OfferRecord from './offerRecord.entity';


// 检查支付状态
export function isProcessed(order) {
  return order.status !== PaymentStatus.PENDING;
}

// 检查订单价格
export function diffTotalFee(totalFee, orderTotalFee) {
  return Number(orderTotalFee) !== Number(totalFee);
}

// 通过订单获取offer
export function getOfferRecordByOrderNumber(orderNumber) {
  return pipe(
    getQB('offeRecord'),
    leftJoinAndMapOne('offerRecord.payment', Payment, 'payment', 'offerRecord.paymentId = payment.id'),
    leftJoinAndMapOne('offerRecord.offer', Offer, 'offer', 'offerRecord.offerId = offer.id'),
    where('offerRecord.orderNumber = :orderNumber', { orderNumber }),
    getOne,
  )(OfferRecord);
}
