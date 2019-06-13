import { user } from "../src/graphql/user/index";
import { createTestClient } from "apollo-server-testing";
import { server } from "../src/app";
import { gql } from "apollo-server-koa";
import { createConnection } from 'typeorm'

beforeAll(() => createConnection())

const Register = gql`
  mutation registry($input: UserRegisterInput!) {
    register(userRegisterInput: $input) {
      id
    }
  }
`;

describe("User", () => {
  it("should register correct", async () => {
    const { query, mutate } = createTestClient(server);
    
    const res = await mutate({
      mutation: Register,
      variables: {
        input: {
          phone: 17602157024,
          role: "MERCHANT",
          password: "123",
          smsCode: "000000"
        }
      }
    });
  });
});
