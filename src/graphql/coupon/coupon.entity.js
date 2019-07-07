import {
  BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { UserCoupon } from './userCoupon.entity';
import { Shop } from '../shop/shop.entity';
import { CouponStatus } from '../../helper/status';

@Entity()
export class Coupon extends BaseEntity {
  @PrimaryGeneratedColumn()
  id

  /**
   * 优惠劵状态 1. 已失效 2. 可使用 3.已使用 4. 已领取
   * @returns {number}
   */
  get status() {
    return this.userCouponStatus
      ? this.userCouponStatus
      : this.couponExpiredStatus;
  }

  get isExpired() {
    return this.coupunExpiredStatus === Coupon.HAS_EXPIRED;
  }

  get couponExpiredStatus() {
    return this.expiredAt < Date.now() ? CouponStatus.HAS_EXPIRED : CouponStatus.AVAILABLE;
  }

  /**
   * 用户使用优惠券情况
   * @returns {null|number}
   */
  get userCouponStatus() {
    if (this.userCoupon) {
      return this.userCoupon.useStatus ? CouponStatus.HAS_USED : CouponStatus.HAS_COLLECTED;
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
    type: 'character varying',
    nullable: true,
  })
  desc;

  @Column({
    type: 'bigint',
    name: 'expired_at',
  })
  expiredAt;

  @Column({
    type: 'character varying',
    name: 'start_at',
  })
  startAt;

  @Column({
    type: 'int',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt

  @ManyToOne(type => Shop)
  shop

  @OneToMany(type => UserCoupon, userCoupon => userCoupon.coupon)
  userCoupon
}
