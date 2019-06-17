import { createTestClient } from "apollo-server-testing";
import { makeServe } from "../src/app";
import { gql } from "apollo-server-koa";
import { createConnection } from "typeorm";
import { formateID } from "../src/helper/id";
import { UserFetch } from "./user.fetch";

const testServer = makeServe(() => ({
  session: {
    "17602157024": "000000"
  }
}));

let connection;
let userFetch;
let userId = formateID("user", 1);
let user = {
  phone: 17602157024,
  name: "leo",
  address: "china"
};

describe("User", () => {
  beforeAll(async () => {
    userFetch = new UserFetch(createTestClient(testServer));
    connection = await createConnection();
  });

  afterAll(() => connection.close());

  it("should register correct", async () => {
    const res = await userFetch.register({
      ...user,
      password: "123",
      smsCode: "000000"
    });
    expect(res.data.register.id).toEqual(userId);
  });

  it("should be able to fetch single user by id", async () => {
    const res = await userFetch.fetchUserInfo(userId);
    expect(res).toEqual(user);
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
    expect(res.id).toEqual(userId);
    const afterUpdate = await userFetch.fetchUserInfo(userId);
    expect(afterUpdate).toEqual({
      ...user,
      ...newUserInfo
    });
  });
});
