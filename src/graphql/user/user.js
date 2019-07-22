import { User } from './user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import {
  decrypt, comparePassword, generateToken, hashPassword,
} from '../../helper/encode';
import { SMSCode } from '../thridAPI/smsCode.entity';
import {
  RootRegistryError,
  UserHasRegisterdError,
  UserNotExistsError,
  InValidPasswordError,
  ValidSmsCodeError,
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
    phone, smsCode, role, password, ...rest
  }) {
    const instane = await SMSCode.findOneOrFail(phone);
    if (instane.smsCode !== smsCode) throw new ValidSmsCodeError();
    if (role === 3) throw new RootRegistryError();
    if (await User.findOne({ phone })) throw new UserHasRegisterdError();
    return User.save({
      phone,
      role,
      password: hashPassword(password),
      ...rest,
    });
  }

  static async loginIn({ phone, password }) {
    const user = await User.findOneOrFail({
      phone,
    });
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

  static async retrievePassword({ phone, smsCode, password }) {
    const instane = await SMSCode.findOneOrFail(phone);
    if (instane.smsCode !== smsCode) throw new ValidSmsCodeError();
    const user = await User.findOneOrFail({
      phone,
    });
    return User.merge(user, {
      password: hashPassword(password),
    }).save();
  }
}
