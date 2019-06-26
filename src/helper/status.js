/**
 * 生意圈举报状态
 * IS_NOT_REPORT: 未被举报
 * IS_REPORTED: 已举报
 */
export const ReportStatus = {
  IS_NOT_REPORT: 1,
  IS_REPORTED: 2,
};

/**
 * 分类状态
 *  HOT: 热门,
 *  NORMAL: 正常,
 */
export const CategoryStatus = {
  HOT: 1,
  NORMAL: 2,
};

/**
 * 优惠券状态
 *  HAS_EXPIRED: 已过期
 *  AVAILABLE: 可使用
 *  HAS_USED:  已使用
 *  HAS_COLLECTED: 已领取
 */
export const CouponStatus = {
  HAS_EXPIRED: 1,
  AVAILABLE: 2,
  HAS_USED: 3,
  HAS_COLLECTED: 4,
};

/**
 * 商品上下架状态
 * ONLINE: 上架
 * OFFLINE: 下架
 */
export const GooDStatus = {
  ONLINE: 1,
  OFFLINE: 2,
};

/**
 * 支付状态
 * PAID: 已支付
 * PENDING: 支付中
 * CANCELED: 已取消
 * PAY_FAIL: 支付失败
 */
export const PaymentStatus = {
  PAID: 2,
  PENDING: 3,
  CANCELED: 10,
  PAY_FAIL: 20,
};

/**
 * 店铺状态
 * NORMAL: 正常营业
 * SUSPEND: 暂停营业
 */
export const ShopStatus = {
  NORMAL: 1,
  SUSPEND: 2,
};

/**
 * 用户角色
 * CUSTOMER: 用户
 * MERCHANT: 商户
 * ROOT: 管理员
 */
export const Role = {
  CUSTOMER: 1,
  MERCHANT: 2,
  ROOT: 3,
};
