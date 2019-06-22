import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../user/user.entity'
import { Coupon } from './coupon.entity'
import { decodeNumberId } from '../../helper/id'

@Entity()
export class UserCoupon extends  BaseEntity {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    name: 'use_status',
    type: 'boolean',
    comment: "使用情况",
    default: false
  })
  useStatus;

  @ManyToOne(type => User, user => user.userCoupon)
  user

  @ManyToOne(type => Coupon, coupon => coupon.userCoupon)
  coupon;

  /**
   * 检验用户是否已经领取了优惠劵
   * @param user
   * @param coupon
   */
  static async hasCollected(user, coupon) {
    return  UserCoupon.createQueryBuilder("userCoupon")
      .innerJoin('userCoupon.user', 'user', 'user.id = :userId', { userId: user.id })
      .innerJoin('userCoupon.coupon', 'coupon', 'coupon.id = :couponId', { couponId: coupon.id})
      .getOne();
  }

  /**
   * 领取优惠券
   * @param userId
   * @param couponId
   * @returns {Promise<{id, status: boolean}>}
   */
  static async collectCoupon({ userId, id: couponId }) {
    const user = User.create({
      id: decodeNumberId(userId)
    });

    const coupon = await Coupon.findOne({
      id: decodeNumberId(couponId)
    });

    if (coupon.isExpired) {
      throw new Error('优惠劵已过期')
    }
    if (await UserCoupon.hasCollected(user, coupon)) {
      throw new Error('该用户已经领取了优惠劵')
    }

    try {
      await  UserCoupon.storeUserCoupon(user, coupon);
      return {
        id: coupon.id,
        status: false
      }
    } catch (e) {
      throw e;
    }
  }

  static async storeUserCoupon(user, coupon) {
    await UserCoupon.create({
      user,
      coupon
    }).save();
  }
}
