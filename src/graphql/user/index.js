import User from "./User.gql";
import { createUserModel } from "./user";
import { db } from "../../db";

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
        total: result.length > 0 ? result[0].node.total : 0
      };
    }
  },
  Mutation: {
    register(obj, { userRegisterInput }, ctx) {
      const user = createUserModel(db);
      // check smsCode
      if (userRegisterInput.smsCode !== ctx.session.smsCode) {
        throw new Error("SMS verification code error");
      }
      
      // forbid root regsiter
      if (userRegisterInput.role === 3) {
        throw new Error("Root Can`t Be Registerd");
      }

      if (user.checkUserExists(userRegisterInput.phone)) {
        throw new Error("User has already register")
      }

      return user.addNewUser(userRegisterInput).then(result => {
        // clear session after register
        ctx.session.smsCode = "";
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
    }
  }
};

export const user = {
  typeDef: `${User}`,
  resolvers
};
