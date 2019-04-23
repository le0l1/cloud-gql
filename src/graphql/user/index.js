import User from "./User.gql";
import { createUserModel } from "./user";
import { db } from "../../db";

const resolvers = {
  Query: {
    user: () => ({ name: "123" })
  },
  Mutation: {
    register(obj, { userRegisterInput }) {
      const user = createUserModel(db);
      return user.addNewUser(userRegisterInput);
    },
    loginIn(obj, { userLoginInput }) {
      const user = createUserModel(db);
      return user.findUserByPhone(userLoginInput);
    }
  }
};

export const user = {
  typeDef: `${User}`,
  resolvers
};
