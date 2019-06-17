import { gql } from "apollo-server-koa";

export class UserFetch {
  constructor(client, userInfo, userId) {
    this.mutate = client.mutate;
    this.query = client.query;
  }

  register(userInfo) {
    const register = gql`
      mutation register($input: UserRegisterInput!) {
        register(userRegisterInput: $input) {
          id
        }
      }
    `;
    return this.mutate({
      mutation: register,
      variables: {
        input: {
          ...userInfo
        }
      }
    });
  }

  async fetchUserInfo(userId) {
    const fetchUser = gql`
      query fetchUser($input: UserQueryInput!) {
        user(userQueryInput: $input) {
          phone
          name
          address
        }
      }
    `;
    const res = await this.query({
      query: fetchUser,
      variables: {
        input: {
          id: userId
        }
      }
    });

    return res.data.user;
  }

  async updateUserInfo(userInfo) {
    const updateUserInfo = gql`
      mutation updateUser($input: UserUpdateInput!) {
        updateUser(userUpdateInput: $input) {
          id
          status
        }
      }
    `;
    const res = await this.mutate({
      mutation: updateUserInfo,
      variables: {
        input: {
          ...userInfo
        }
      }
    });
    return res.data.updateUser;
  }
}
