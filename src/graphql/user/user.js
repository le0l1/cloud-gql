import { User } from './user.entity';
import { decodeNumberId } from '../../helper/util';
import { decrypt } from '../../helper/encode';
import { SMSCode } from '../thridAPI/smsCode.entity';
import { ValidSmsCodeError, RootRegistryError, UserHasRegisterdError } from '../../helper/error';

export default class UserResolver {
  static async searchUserPassword({ id }) {
    const user = await User.findOneOrFail(decodeNumberId(id));
    return User.merge(user, {
      password: decrypt(user.password),
    });
  }

  static async register({
    phone, smsCode, role, ...rest
  }) {
    const { smsCode: correctCode } = await SMSCode.findOneOrFail(phone);
    if (correctCode !== smsCode) throw new ValidSmsCodeError();
    if (role === 3) throw new RootRegistryError();
    if (await User.checkIfExists(phone)) throw new UserHasRegisterdError();
    // delete used code async
    await SMSCode.delete(phone);
    return User.createUser({
      phone,
      smsCode,
      role,
      ...rest,
    });
  }
}
