import { createTestClient } from "apollo-server-testing";
import { makeServe } from "../src/app";
import { gql } from "apollo-server-koa";
import { createConnection } from "typeorm";
import { formateID } from "../src/helper/id";

const testServer = makeServe(() => ({
  session: {
    "17602157024": "000000"
  }
}));

let client;
let connection;
let user = {
  phone: 17602157024,
  role: "MERCHANT",
  name: "leo",
  address: "china"
};
const userId = formateID("user", 1);

describe("User", () => {
  beforeAll(async () => {
    client = createTestClient(testServer);
    connection = await createConnection();
  });

  afterAll(() => connection.close());

  it("should register correct", async () => {
    const Register = gql`
      mutation registry($input: UserRegisterInput!) {
        register(userRegisterInput: $input) {
          id
        }
      }
    `;
    const res = await client.mutate({
      mutation: Register,
      variables: {
        input: {
          ...user,
          password: "123",
          smsCode: "000000"
        }
      }
    });
    expect(res.data.register.id).toEqual(userId);
  });

  it("should be able to fetch single user by id", async () => {
    const fetchUser = gql`
      query fetchUser($input: UserQueryInput!) {
        user(userQueryInput: $input) {
          phone
          role
          name
          address
        }
      }
    `;
    const res = await client.query({
      query: fetchUser,
      variables: {
        input: {
          id: userId
        }
      }
    });
    expect(res.data.user).toEqual(user);
  });
});
