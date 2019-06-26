export class UserNotExistsError extends Error {
  message = '用户不存在'
}

export class InValidPasswordError extends Error {
  message = '密码错误'
}
