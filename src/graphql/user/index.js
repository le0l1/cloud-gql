import UserSchema from "./User.gql";
import { createUserModel } from "./user";
import { db } from "../../helper/database/db";
import { User } from "./user.entity";
import { formateID } from "../../helper/id";

const resolvers = {
  Query: {
    users: (_, { userQueryInput }) => {
      const user = createUserModel(db);
      return user.fuzzySearchUser(userQueryInput);
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
  Mutation: {
    async register(obj, { userRegisterInput }, ctx) {
      const user = createUserModel(db);
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

      return user.addNewUser(userRegisterInput).then(result => {
        // clear session after register
        ctx.session[phone] = "";
        return result;
      });
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
      if (retrievePasswordInput.smsCode !== ctx.session.smsCode) {
        throw new Error("验证码错误");
      }
      const { id } = await User.retrievePassword(retrievePasswordInput);
      return {
        id: formateID("user", id),
        status: true
      };
    }
  }
};

export const user = {
  typeDef: UserSchema,
  resolvers
};
