import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { decodeNumberId } from '../../helper/id'
import { Good } from '../good/good.entity'
import { UserCoupon } from './userCoupon.entity'

@Entity()
export class Coupon extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  /**
   * 优惠劵状态 1. 已失效 2. 可使用 3.已使用 4. 已领取
   * @returns {number}
   */
  get status () {
    console.log(this.userCouponStatus)
    return this.userCouponStatus ?
      this.userCouponStatus :
      this.couponExpiredStatus
  }

  get isExpired () {
    return this.coupunExpiredStatus === 1
  }

  get couponExpiredStatus() {
    return this.expiredAt < Date.now() ? 1 : 3
  }
  /**
   * 用户使用优惠券情况
   * @returns {null|number}
   */
  get userCouponStatus() {
    console.log(this)
    if (this.userCoupon) {
      return this.userCoupon.useStatus ? 3 : 4;
    }
    return null;
  }

  @Column({
    type: 'numeric',
    name: 'bigger_than',
  })
  biggerThan

  @Column({
    type: 'numeric',
  })
  discount

  @Column({
    type: 'bigint',
    name: 'expired_at'
  })
  expiredAt

  @Column({
    type: 'int',
    nullable: true,
    name: 'deleted_at'
  })
  deletedAt

  @ManyToOne(type => Good, good => Good.coupon)
  good

  @OneToMany(type => UserCoupon, userCoupon => userCoupon.coupon)
  userCoupon

  static createCoupon ({
                         goodId,
                         ...rest
                       }) {
    return Coupon.store({
      good: Good.create({ id: decodeNumberId(goodId) }),
      ...rest
    })
  }

  static async store (params) {
    try {
      const { id } = await Coupon.create(
        params
      ).save()
      return {
        id,
        status: true
      }
    } catch (e) {
      throw e
    }
  }

  static updateCoupon ({
                         id,
                         ...rest
                       }) {
    return Coupon.store({
      id: decodeNumberId(id),
      ...rest
    })
  }

  static deleteCoupon ({ id }) {
    return Coupon.store({
      id: decodeNumberId(id),
      deletedAt: Date.now()
    })
  }

  static searchCoupon ({ goodId, userId }) {
    if (!userId) {
      return Coupon.find({
        where: {
          good: Good.create({ id: decodeNumberId(goodId) })
        }
      })
    }

    return Coupon.createQueryBuilder('coupon')
      .leftJoinAndMapOne(
        'coupon.userCoupon',
        'coupon.userCoupon',
        'userCoupon',
        'userCoupon.user.id = :userId',
        {
          userId: decodeNumberId(userId)
        }
      )
      .getMany()
  }
}
