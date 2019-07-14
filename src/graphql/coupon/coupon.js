import { decodeNumberId, pipe } from '../../helper/util';
import { Coupon } from './coupon.entity';
import { UserCoupon } from './userCoupon.entity';
import { Shop } from '../shop/shop.entity';
import { User } from '../user/user.entity';
import { CouponExpiredError, CouponHasCollectedError } from '../../helper/error';
import { getQB, where, getMany } from '../../helper/sql';

export default class CouponResolver {
  static async createCoupon({ shopId, ...rest }) {
    const shop = await Shop.findOneOrFail(decodeNumberId(shopId));
    return Coupon.create({
      shop,
      ...rest,
    }).save();
  }

  static async updateCoupon({ id, ...rest }) {
    const coupon = await Coupon.findOneOrFail(decodeNumberId(id));
    return Coupon.merge(coupon, rest).save();
  }

  static async deleteCoupon({ id }) {
    const realId = decodeNumberId(id);
    return Coupon.delete(realId).then(() => ({
      id: realId,
    }));
  }

  static async searchCoupon({ shopId, userId, isExpired = false }) {
    if (!userId) {
      return CouponResolver.searchShopCoupons({ shopId, isExpired });
    }

    if (!shopId) {
      return CouponResolver.searchUserCoupons({ shopId, isExpired });
    }

    const shop = await Shop.findOneOrFail(decodeNumberId(shopId));
    const user = await User.findOneOrFail(decodeNumberId(userId));
    const qb = Coupon.createQueryBuilder('coupon')
      .leftJoinAndMapOne(
        'coupon.userCoupon',
        'coupon.userCoupon',
        'userCoupon',
        'userCoupon.user = :user',
        {
          user: user.id,
        },
      )
      .andWhere('coupon.shop = :shop', { shop: shop.id });
    return pipe(
      where('coupon.expiredAt < :expiredAt', { expiredAt: isExpired ? Date.now() : null }),
      getMany,
    )(qb);
  }

  static async searchShopCoupons({ shopId, isExpired }) {
    const shop = await Shop.findOneOrFail(decodeNumberId(shopId));
    return pipe(
      getQB('coupon'),
      where('coupon.shop = :shop', { shop: shop.id }),
      where('coupon.expiredAt < :expiredAt', { expiredAt: isExpired ? Date.now() : null }),
      getMany,
    )(Coupon);
  }

  static async searchUserCoupons({ userId, isExpired }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    return pipe(
      getQB('coupon'),
      where('coupon.user = :user', { user: user.id }),
      where('coupon.expiredAt < :expiredAt', { expiredAt: isExpired ? Date.now() : null }),
      getMany,
    )(Coupon);
  }

  /**
   * 领取优惠券
   * @param userId
   * @param couponId
   * @returns {Promise<{id, status: boolean}>}
   */
  static async collectCoupon({ userId, id: couponId }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    const coupon = await Coupon.findOneOrFail(decodeNumberId(couponId));
    if (coupon.isExpired) throw new CouponExpiredError();
    if (
      await UserCoupon.findOne({
        user,
        coupon,
      })
    ) throw new CouponHasCollectedError();
    await UserCoupon.save({
      user,
      coupon,
    });
    return {
      id: coupon.id,
    };
  }
}
