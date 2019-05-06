import User from "./User.gql";
import { createUserModel } from "./user";
import { db } from "../../db";

const resolvers = {
  Query: {
    user: (_, { userQueryInput }) => {
      const user = createUserModel(db);
      return user.fuzzySearchUser(userQueryInput);
    }
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
    register(obj, { userRegisterInput }) {
      const user = createUserModel(db);
      return user.addNewUser(userRegisterInput);
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
