export class UserNotExistsError extends Error {
  message = '用户不存在'
}

export class InValidPasswordError extends Error {
  message = '密码错误'
}


export class ShopNotExistsError extends Error {
  message = '店铺不存在'
}

export class StockLackError extends Error {
  message = '商品数量不足'
}

export class CouponExpiredError extends Error {
  message = '优惠券已过期'
}

export class CouponHasCollectedError extends Error {
  message = '已领取过该优惠券'
}

export class DumplicateShopNameError extends Error {
  message = '店铺名称重复'
}

export class ValidSmsCodeError extends Error {
  message = '短信验证码错误'
}

export class RootRegistryError extends Error {
  message = '禁止注册ROOT权限账户'
}

export class UserHasRegisterdError extends Error {
  message = '该用户已注册'
}