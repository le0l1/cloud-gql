import UserSchema from './User.gql';
import { User } from './user.entity';
import { formateID, decodeNumberId, pipe } from '../../helper/util';
import { UserNotExistsError, InValidPasswordError } from '../../helper/error';
import { comparePassword, generateToken } from '../../helper/encode';
import {
  getQB, where, withPagination, getManyAndCount,
} from '../../helper/sql';
import { Role } from '../../helper/status';

const formateUserId = v => (v.id ? formateID('user', v.id) : null);

const resolvers = {
  Query: {
    users: (_, { usersQueryInput }) => {
      const {
        tsQuery, limit = 8, filters = {}, offset = 1,
      } = usersQueryInput;
      return pipe(
        getQB('user'),
        where('(user.name like :tsQuery or user.phone like :tsQuery)', {
          tsQuery: tsQuery ? `%${tsQuery}%` : null,
        }),
        where('user.area = :area', { area: filters.area }),
        where('user.role = :role', { role: filters.role }),
        withPagination(limit, offset),
        getManyAndCount,
      )(User);
    },
    user(_, { userQueryInput }) {
      return User.getUser(userQueryInput);
    },
  },
  UserConnection: {
    edges(v) {
      return v[0];
    },
    pageInfo(v) {
      return v;
    },
  },
  User: {
    id: formateUserId,
  },
  UserActionResult: {
    id: formateUserId,
  },
  Role,
  Mutation: {
    async register(obj, { userRegisterInput }, ctx) {
      const { phone } = userRegisterInput;
      // check smsCode
      if (userRegisterInput.smsCode !== ctx.session[phone]) {
        throw new Error('验证码错误');
      }

      // forbid root regsiter
      if (userRegisterInput.role === 3) {
        throw new Error('禁止注册ROOT权限账户');
      }

      if (await User.checkIfExists(phone)) {
        throw new Error('该用户已注册');
      }

      ctx.session[phone] = '';
      return User.createUser(userRegisterInput);
    },
    // TODO: 重构user相关schema
    async loginIn(_, { userLoginInput }) {
      const user = await User.findByPhone(userLoginInput.phone);
      if (!user) throw new UserNotExistsError();
      if (
        !comparePassword({
          hash: user.password,
          salt: user.salt,
          pwd: userLoginInput.password,
        })
      ) {
        throw new InValidPasswordError();
      }
      return {
        ...user,
        token: generateToken(user),
      };
    },
    async deleteUser(_, { userDeleteInput }) {
      try {
        const user = User.findOneOrFail({ id: decodeNumberId(userDeleteInput.id) });
        user.deletedAt = new Date();
        return user.save();
      } catch (e) {
        throw new UserNotExistsError();
      }
    },
    async retrievePassword(_, { retrievePasswordInput }, ctx) {
      const { phone } = retrievePasswordInput;
      if (retrievePasswordInput.smsCode !== ctx.session[phone]) {
        throw new Error('验证码错误');
      }
      const { id } = await User.retrievePassword(retrievePasswordInput);
      return {
        id: formateID('user', id),
        status: true,
      };
    },
    updateUser(_, { userUpdateInput }) {
      return User.updateUserInfo(userUpdateInput);
    },
  },
};

export const user = {
  typeDef: UserSchema,
  resolvers,
};
