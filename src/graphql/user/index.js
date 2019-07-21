import UserSchema from './User.gql';
import { User } from './user.entity';
import { formateID } from '../../helper/util';
import { Role } from '../../helper/status';
import { idResolver } from '../../helper/resolver';
import UserResolver from './user';

const formateUserId = v => (v.id ? formateID('user', v.id) : null);

const resolvers = {
  Query: {
    users(_, { usersQueryInput }) {
      return UserResolver.searchUsers(usersQueryInput);
    },
    user(_, { userQueryInput }) {
      return UserResolver.searchUser(userQueryInput);
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
      return UserResolver.deleteUser(userDeleteInput);
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
