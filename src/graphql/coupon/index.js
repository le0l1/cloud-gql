import CouponScheam from './coupon.graphql';
import { Coupon } from './coupon.entity';
import { prop, pipe, formateID } from '../../helper/util';
import { UserCoupon } from './userCoupon.entity';
import { CouponStatus } from '../../helper/status';

const formateCouponId = pipe(
  prop('id'),
  formateID.bind(null, 'coupon'),
);
const resolvers = {
  Mutation: {
    createCoupon(_, { createCouponInput }) {
      return Coupon.createCoupon(createCouponInput);
    },
    updateCoupon(_, { updateCouponInput }) {
      return Coupon.updateCoupon(updateCouponInput);
    },
    deleteCoupon(_, { deleteCouponInput }) {
      return Coupon.deleteCoupon(deleteCouponInput);
    },
    collectCoupon(_, { collectCouponInput }) {
      return UserCoupon.collectCoupon(collectCouponInput);
    },
  },
  Query: {
    coupons(_, { query }) {
      return Coupon.searchCoupon(query);
    },
  },
  CouponStatus,
  Coupon: {
    id: formateCouponId,
  },
  CouponActionResult: {
    id: formateCouponId,
  },
};

export const coupon = {
  typeDef: CouponScheam,
  resolvers,
};
