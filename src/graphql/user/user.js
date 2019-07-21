import { User } from './user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { decrypt, comparePassword, generateToken } from '../../helper/encode';
import { SMSCode } from '../thridAPI/smsCode.entity';
import {
  ValidSmsCodeError,
  RootRegistryError,
  UserHasRegisterdError,
  UserNotExistsError,
  InValidPasswordError,
} from '../../helper/error';
import {
  getManyAndCount, getQB, where, withPagination,
} from '../../helper/sql';

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
    SMSCode.delete(phone);
    return User.createUser({
      phone,
      smsCode,
      role,
      ...rest,
    });
  }

  static async loginIn({ phone, password }) {
    const user = await User.findByPhone(phone);
    if (!user) throw new UserNotExistsError();
    if (
      !comparePassword({
        hash: user.password,
        pwd: password,
      })
    ) {
      throw new InValidPasswordError();
    }
    return {
      ...user,
      token: generateToken(user),
    };
  }

  static async updateUser({ id, ...rest }) {
    const user = await User.findOneOrFail(decodeNumberId(id));
    return User.merge(user, rest).save();
  }

  static async deleteUser({ id }) {
    const user = await User.findOneOrFail({ id: decodeNumberId(id) });
    return User.merge(user, { deletedAt: new Date() }).save();
  }

  static searchUsers({
    tsQuery, limit = 8, filters = {}, offset = 1,
  }) {
    return pipe(
      getQB('user'),
      where('(user.name like :tsQuery or user.phone like :tsQuery)', {
        tsQuery: tsQuery ? `%${tsQuery}%` : null,
      }),
      where('user.area = :area', { area: filters.area }),
      where('user.role = :role', { role: filters.role }),
      where('user.deletedAt is null'),
      withPagination(limit, offset),
      getManyAndCount,
    )(User);
  }

  static searchUser({ id }) {
    return User.findOneOrFail(decodeNumberId(id));
  }
}
