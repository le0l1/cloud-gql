import CouponScheam from './Coupon.graphql';
import { prop, pipe, formateID } from '../../helper/util';
import { CouponStatus } from '../../helper/status';
import CouponResolver from './coupon';

const formateCouponId = pipe(
  prop('id'),
  formateID.bind(null, 'coupon'),
);
// TODO: 查询user的优惠券
const resolvers = {
  Mutation: {
    createCoupon(_, { createCouponInput }) {
      return CouponResolver.createCoupon(createCouponInput);
    },
    updateCoupon(_, { updateCouponInput }) {
      return CouponResolver.updateCoupon(updateCouponInput);
    },
    deleteCoupon(_, { deleteCouponInput }) {
      return CouponResolver.deleteCoupon(deleteCouponInput);
    },
    collectCoupon(_, { collectCouponInput }) {
      return CouponResolver.collectCoupon(collectCouponInput);
    },
  },
  Query: {
    coupons(_, { query }) {
      return CouponResolver.searchCoupon(query);
    },
  },
  CouponStatus,
  Coupon: {
    id: formateCouponId,
  },
  CouponActionResult: {
    id: formateCouponId,
    status: () => true,
  },
};

export const coupon = {
  typeDef: CouponScheam,
  resolvers,
};
