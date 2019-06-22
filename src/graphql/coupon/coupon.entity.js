import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { decodeNumberId } from '../../helper/id'
import { Good } from '../good/good.entity'
import { User } from '../user/user.entity'

@Entity()
export class Coupon extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  /**
   * 优惠劵状态 1. 已失效 2. 已领取 3. 可使用
   * @returns {number}
   */
  get status() {
    return this.expiredAt < Date.now() ? 1 : 3
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

  @ManyToMany(type => User, user => user.coupons)
  user

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

  static searchCoupon({ goodId, userId }) {
    return Coupon.find({
      where: {
        good: Good.create({ id: decodeNumberId(goodId)})
      }
    })
  }
}
