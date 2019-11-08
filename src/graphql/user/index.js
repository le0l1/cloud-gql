import UserSchema from './User.graphql';
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
    phoneCount(v) {
      return v.phoneRecord ? v.phoneRecord.length : 0;
    },
  },
  UserActionResult: {
    id: formateUserId,
    status: () => true,
  },
  UserRegisterResult: idResolver('user'),
  UserLoginResult: {
    ...idResolver('user'),
  },
  RetrievePasswordResult: {
    id: formateUserId,
    status: () => true,
  },
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
    async retrievePassword(_, { retrievePasswordInput }) {
      return UserResolver.retrievePassword(retrievePasswordInput);
    },
    updateUser(_, { userUpdateInput }) {
      return UserResolver.updateUser(userUpdateInput);
    },
    registerRoot(_, { input }) {
      return UserResolver.registerRoot(input);
    },
    deleteRoot(_, { id }) {
      return UserResolver.deleteRoot(id);
    },
  },
};

export const user = {
  typeDef: UserSchema,
  resolvers,
};
