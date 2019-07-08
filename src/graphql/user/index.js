import UserSchema from './User.gql';
import { User } from './user.entity';
import { formateID, decodeNumberId, pipe } from '../../helper/util';
import { UserNotExistsError, InValidPasswordError } from '../../helper/error';
import { comparePassword, generateToken } from '../../helper/encode';
import {
  getQB, where, withPagination, getManyAndCount,
} from '../../helper/sql';
import { Role } from '../../helper/status';
import { idResolver } from '../../helper/resolver';
import UserResolver from './user';

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
    userPassword(_, { userQueryInput }) {
      return UserResolver.searchUserPassword(userQueryInput);
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
    status: () => true,
  },
  UserRegisterResult: idResolver('user'),
  UserLoginResult: idResolver('user'),
  Role,
  Mutation: {
    async register(obj, { userRegisterInput }) {
      return UserResolver.register(userRegisterInput);
    },
    loginIn(_, { userLoginInput }) {
      return UserResolver.loginIn(userLoginInput);
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
    // TODO: 重构找回密码
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
      return UserResolver.updateUser(userUpdateInput);
    },
  },
};

export const user = {
  typeDef: UserSchema,
  resolvers,
};
