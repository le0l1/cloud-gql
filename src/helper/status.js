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
export const GoodStatus = {
  ONLINE: 1,
  OFFLINE: 2,
};

/**
 * 支付状态
 * PAID: 已支付
 * PENDING: 支付中
 * CANCELED: 已取消
 * PAY_FAIL: 支付失败
 * ODD: 支付异常
 */
export const PaymentStatus = {
  PAID: 2,
  PENDING: 3,
  CANCELED: 10,
  PAY_FAIL: 20,
  ODD: 40,
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
/**
 * 订单状态
 * PENDING: 待付款
 * WAIT_SHIP: 待发货
 * WAIT_RECEIPT: 待收货
 * WAIT_EVALUATION: 待评价
 * WAIT_REFUND: 待退款
 * CANCELED: 已取消
 * UNUSUAL: 异常
 * COMPLETE: 订单完成
 */
export const OrderStatus = {
  PENDING: 'PENDING',
  WAIT_SHIP: 'WAIT_SHIP',
  WAIT_RECEIPT: 'WAIT_RECEIPT',
  WAIT_EVALUATION: 'WAIT_EVALUATION',
  WAIT_REFUND: 'WAIT_REFUND',
  CANCELED: 'CANCELED',
  UNUSUAL: 'UNUSUAL',
  COMPLETE: 'COMPLETE',
};
/**
 * 交易状态
 * TRANSFERING: 转账中
 * COMPLETED: 转账完成
 */
export const TransferStatus = {
  TRANSFERING: 'TRANSFERING',
  COMPLETED: 'COMPLETED',
};
/**
 * 提现方式
 * ALIPAY: 支付宝
 * WXPAY: 微信
 */
export const WithdrawMethod = {
  ALIPAY: 'ALIPAY',
  WXPAY: 'WXPAY',
};
/**
 * 提现状态
 * WAIT_REVIEW: 待审核
 * NOT_PASSED; 已拒绝
 * PASSED: 已通过
 */
export const WithdrawStatus = {
  WAIT_REVIEW: 'WAIT_REVIEW',
  NOT_PASSED: 'NOT_PASSED',
  PASSED: 'PASSED',
};

/**
 * 金币商城 订单状态
 * WAIT_SHIP: 待发货
 * WAIT_RECEIPT: 待收货
 * UNUSUAL: 异常
 * COMPLETE: 订单完成
 */
export const GoldProductRecordStatus = {
  WAIT_SHIP: 'WAIT_SHIP',
  WAIT_RECEIPT: 'WAIT_RECEIPT',
  UNUSUAL: 'UNUSUAL',
  COMPLETE: 'COMPLETE',
};
/**
 * 商户类型
 *  TRUCK_PARTS 拆车件
 *  NORMAL  正常
 */
export const ShopType = {
  TRUCK_PARTS: 'TRUCK_PARTS',
  NORMAL: 'NORMAL',
};
