import { gql } from "apollo-server-koa";
import { UserFetch } from "./user.fetch";
import { makeServe } from "../../src/app";
import { formateID } from "../../src/helper/id";

const userFetch = new UserFetch();
const userId = formateID("user", 1);
const user = {
  phone: 17602157024,
  name: "leo",
  address: "china"
};

describe("User", () => {
  it("should register correct", async () => {
    const res = await userFetch.register({
      ...user,
      password: "123",
      smsCode: "000000"
    });
    expect(res.register.id).toEqual(userId);
  });

  it("should be able to fetch single user by id", async () => {
    const res = await userFetch.fetchUserInfo(userId);
    expect(res.user).toEqual(user);
  });

  it("should update user info correct", async () => {
    const newUserInfo = {
      name: "leo123",
      address: "china"
    };
    const res = await userFetch.updateUserInfo({
      id: userId,
      ...newUserInfo
    });
    expect(res.updateUser.id).toEqual(userId);
    const afterUpdate = await userFetch.fetchUserInfo(userId);
    expect(afterUpdate.user).toEqual({
      ...user,
      ...newUserInfo
    });

  });
});
