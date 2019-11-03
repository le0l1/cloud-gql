import { getManager } from 'typeorm';
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
  getManyAndCount, getQB, where, withPagination, orderBy,
} from '../../helper/sql';
import { Shop } from '../shop/shop.entity';
import { Role } from '../../helper/status';

export default class UserResolver {
  static async searchUserPassword({ id }) {
    const user = await User.findOneOrFail(decodeNumberId(id));
    return User.merge(user, {
      password: decrypt(user.password),
    });
  }

  static register({
    phone, smsCode, role, password, ...rest
  }) {
    return getManager().transaction(async (trx) => {
      const instane = await SMSCode.findOneOrFail(phone);
      if (Number(instane.smsCode) !== Number(smsCode)) throw new ValidSmsCodeError();
      if (role === 3) throw new RootRegistryError();
      const hasRegisterd = await User.findOne({ phone });
      if (hasRegisterd && !hasRegisterd.deletedAt) {
        throw new UserHasRegisterdError();
      }
      const user = await trx.save(User, {
        phone,
        role,
        password: hashPassword(password),
        ...rest,
      });
      //  如果角色为 店家 则创建一家未审核的空店铺
      if (role === 2) {
        await trx.save(Shop, {
          user,
          phone: user.phone,
          name: user.garage,
          area: user.area,
          city: user.city,
          shopType: rest.shopType,
        });
      }
      return user;
    });
  }

  static async loginIn({ phone, password }) {
    const user = await User.findOne({
      where: {
        phone,
        deletedAt: null,
      },
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
    tsQuery, limit = 8, offset = 1, filters = {
      phone: null,
      area: null,
      createdStartAt: null,
      createdEndAt: null,
    },
  }) {
    return pipe(
      getQB('user'),
      where('user.name like :tsQuery', {
        tsQuery: tsQuery ? `%${tsQuery}%` : null,
      }),
      where('user.phone like :tsQuery', {
        tsQuery: filters.phone ? `%${filters.phone}%` : null,
      }),
      where('user.createdAt > :createdStartAt', { createdStartAt: filters.createdStartAt }),
      where('user.createdAt < :createdEndAt', { createdEndAt: filters.createdEndAt }),
      where('user.area like :area or user.city like :area or user.address like :area', {
        area: filters.area ? `%${filters.area}%` : null,
      }),
      where('user.role = :role', { role: filters.role }),
      where('user.deletedAt is null'),
      where('user.phone != :phone', { phone: '888888' }),
      withPagination(limit, offset),
      orderBy({
        'user.createdAt': 'DESC',
      }),
      getManyAndCount,
    )(User);
  }

  static searchUser({ id }) {
    return User.findOneOrFail(decodeNumberId(id));
  }

  static async retrievePassword({ phone, smsCode, password }) {
    const instane = await SMSCode.findOneOrFail(phone);
    if (Number(instane.smsCode) !== Number(smsCode)) throw new ValidSmsCodeError();
    const user = await User.findOneOrFail({
      phone,
    });
    return User.merge(user, {
      password: hashPassword(password),
    }).save();
  }

  static registerRoot({
    password,
    ...rest
  }) {
    return User.save({
      password: hashPassword(password),
      ...rest,
      role: Role.ROOT,
    });
  }

  static async deleteRoot(
    id,
  ) {
    await User.delete(decodeNumberId(id));
    return true;
  }
}
