import CouponScheam from "./coupon.graphql"
import { Coupon } from './coupon.entity'
import { pipe } from '../../helper/database/sql'
import { prop } from '../../helper/util'
import { formateID } from '../../helper/id'
import { UserCoupon } from './userCoupon.entity'

const formateCouponId = pipe(
  prop('id'),
  formateID.bind(null, 'coupon')
)
const resolvers = {
  Mutation: {
    createCoupon(_, { createCouponInput }) {
      return Coupon.createCoupon(createCouponInput)
    },
    updateCoupon(_, { updateCouponInput }) {
      return Coupon.updateCoupon(updateCouponInput)
    },
    deleteCoupon(_, { deleteCouponInput }) {
      return Coupon.deleteCoupon(deleteCouponInput)
    },
    collectCoupon(_, { collectCouponInput }) {
      return UserCoupon.collectCoupon(collectCouponInput);
    },
  },
  Query: {
    coupons (_, { query }) {
      return Coupon.searchCoupon(query)
    },
  },
  Coupon: {
    id: formateCouponId
  },
  CouponStatus: {
    HAS_EXPIRED: 1,
    HAS_USED: 2,
    AVAILABLE: 3
  },
  CouponActionResult: {
    id: formateCouponId
  }
}

export  const coupon = {
  typeDef: CouponScheam,
  resolvers
}
