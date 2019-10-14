import WithdrawBank from './withdrawBank.entity';
import { SMSCode } from '../thridAPI/smsCode.entity';
import { ValidSmsCodeError } from '../../helper/error';
import { decodeNumberId } from '../../helper/util';

// 绑定提现账号
export async function bindAccount(user, {
  code,
  ...rest
}) {
  const currentSMSCode = await SMSCode.findOne({
    phone: user.phone,
  });
  if (Number(currentSMSCode.smsCode) !== Number(code)) throw new ValidSmsCodeError();
  const withdrawBank = await WithdrawBank.findOne({
    userId: user.id,
  });
  return WithdrawBank.save(
    withdrawBank
      ? WithdrawBank.merge(withdrawBank, rest)
      : {
        userId: user.id,
        ...rest,
      },
  );
}

// 获取用户绑定账号
export function getBindAccount(user) {
  return WithdrawBank.findOne({
    userId: user.id,
  });
}

// 取消绑定提现账号
export function cancelBindAccount(user, id) {
  return WithdrawBank.delete({
    id: decodeNumberId(id),
    userId: user.id,
  });
}
