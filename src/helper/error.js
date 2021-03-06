import { ApolloError } from 'apollo-server-koa';

export class UserNotExistsError extends Error {
  message = '用户不存在';
}

export class InValidPasswordError extends Error {
  message = '密码错误';
}

export class ShopNotExistsError extends Error {
  message = '店铺不存在';
}

export class StockLackError extends Error {
  message = '商品数量不足';
}

export class CouponExpiredError extends Error {
  message = '优惠券已过期';
}

export class CouponHasCollectedError extends Error {
  message = '已领取过该优惠券';
}

export class DumplicateShopNameError extends Error {
  message = '店铺名称重复';
}

export class ValidSmsCodeError extends Error {
  message = '短信验证码错误';
}

export class RootRegistryError extends Error {
  message = '禁止注册ROOT权限账户';
}

export class UserHasRegisterdError extends Error {
  message = '该用户已注册';
}

export class UnmatchedAmountError extends Error {
  message = '支付金额不匹配';
}

export class TokenExpiredError extends ApolloError {
  constructor() {
    super('token已过期', 'TokenExpiredError');
  }
}

export class OrderStatusError extends ApolloError {
  constructor() {
    super('订单已支付或已取消', 'OrderStatusError');
  }
}
export class OrderPaidExpiredError extends ApolloError {
  constructor() {
    super('订单已过期', 'OrderPaidExpiredError');
  }
}

export class OrderNotExistsError extends ApolloError {
  constructor() {
    super('订单不存在', 'OrderNotExistsError');
  }
}

export class RefundFailError extends ApolloError {
  constructor(msg) {
    super(`退款失败原因:${msg}`, 'RefundFailError');
  }
}

export class InsufficientBalanceError extends ApolloError {
  constructor() {
    super('用户余额不足', 'InsufficientBalanceError');
  }
}

export class InValidCouponError extends ApolloError {
  constructor() {
    super('优惠券与商品不匹配', 'InValidCouponError');
  }
}

export class CouponNotSatisfiedError extends ApolloError {
  constructor() {
    super('未满足优惠劵使用条件', 'CouponNotSatisfiedError');
  }
}

export class UniqueShopOrderError extends ApolloError {
  constructor() {
    super('一次下单只允许结算一家商铺的商品', 'UniqueShopOrderError');
  }
}

export class OrderUpdateStatusError extends ApolloError {
  constructor() {
    super('订单状态更新失败', 'OrderUpdateStatusError');
  }
}

export class ActivityDateError extends ApolloError {
  constructor() {
    super('活动开始时间不能大于结束时间', 'ActivityDateError');
  }
}

export class ActivityNotStartError extends ApolloError {
  constructor() {
    super('活动尚未开始!', 'ActivityDateError');
  }
}

export class ActivityHadEndedError extends ApolloError {
  constructor() {
    super('活动已结束!', 'ActivityHadEndedError');
  }
}


export class ActivityUnusualError extends ApolloError {
  constructor() {
    super('活动异常！请稍后再试', 'ActivityUnusualError');
  }
}

export class ActivityCheckedError extends ApolloError {
  constructor() {
    super('今日尚未签到, 请签到后再参加活动!', 'ActivityCheckedError');
  }
}

export class ActivityHasDrawedError extends ApolloError {
  constructor() {
    super('今日抽奖次数已用完!', 'ActivityHasDrawedError');
  }
}

export class UserHasCheckedError extends ApolloError {
  constructor() {
    super('今日已签到, 请勿重复签到!', 'UserHasCheckedError');
  }
}
export class RedPacketEmptyError extends ApolloError {
  constructor() {
    super('红包已抢完!', 'RedPacketEmptyError');
  }
}
export class RedPacketGrabedError extends ApolloError {
  constructor() {
    super('请勿重复领取红包!', 'RedPacketGrabedError');
  }
}
export class RedPacketFailError extends ApolloError {
  constructor() {
    super('领取失败！请稍后再试', 'RedPacketFailError');
  }
}

export class GoldLackError extends ApolloError {
  constructor() {
    super('金币数量不足', 'GoldLackError');
  }
}
