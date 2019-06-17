import UserSchema from "./User.gql";
import { createUserModel } from "./user";
import { db } from "../../helper/database/db";
import { User } from "./user.entity";
import { formateID } from "../../helper/id";

const formateUserId = 
    (v) => {
      return v.id ? formateID('user', v.id) : null;
    }

const resolvers = {
  Query: {
    users: (_, { usersQueryInput }) => {
      const user = createUserModel(db);
      return user.fuzzySearchUser(usersQueryInput);
    },
    user(_, { userQueryInput}) {
      return User.getUser(userQueryInput)
    }
  },
  Role: {
    CUSTOMER: 1,
    MERCHANT: 2,
    ROOT: 3
  },
  UserConnection: {
    edges(result) {
      return result;
    },
    pageInfo(result) {
      return {
        hasNextPage: result.length > 0,
        total: result.length > 0 ? result[0].total : 0
      };
    }
  },
  User: {
    id: formateUserId
  },
  UserActionResult: {
    id: formateUserId
  },
  Mutation: {
    async register(obj, { userRegisterInput }, ctx) {
      const { phone } = userRegisterInput;
      // check smsCode
      if (userRegisterInput.smsCode !== ctx.session[phone]) {
        throw new Error("验证码错误");
      }

      // forbid root regsiter
      if (userRegisterInput.role === 3) {
        throw new Error("禁止注册ROOT权限账户");
      }

      if (await User.checkIfExists(phone)) {
        throw new Error("该用户已注册");
      }
      

      ctx.session[phone] = "";
      return User.createUser(userRegisterInput);
    },
    loginIn(obj, { userLoginInput }) {
      const user = createUserModel(db);
      return user.findUserByPhone(userLoginInput);
    },
    deleteUser(_, { userDeleteInput }) {
      const user = createUserModel(db);
      return user.deleteUserByID(userDeleteInput);
    },
    async retrievePassword(_, { retrievePasswordInput }, ctx) {
      const { phone } = retrievePasswordInput;
      if (retrievePasswordInput.smsCode !== ctx.session[phone]) {
        throw new Error("验证码错误");
      }
      const { id } = await User.retrievePassword(retrievePasswordInput);
      return {
        id: formateID("user", id),
        status: true
      };
    },
    updateUser(_, { userUpdateInput }) {
      return User.updateUserInfo(userUpdateInput);
    }
  }
};

export const user = {
  typeDef: UserSchema,
  resolvers
};
