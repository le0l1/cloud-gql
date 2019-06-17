import { BaseFetch } from "../baseFetch";

export class UserFetch extends BaseFetch {
  register(userInfo) {
    const register = `
      mutation register($input: UserRegisterInput!) {
        register(userRegisterInput: $input) {
          id
        }
      }
    `;
    return this.client.request(register, {
      input: {
        ...userInfo
      }
    });
  }

  async fetchUserInfo(userId) {
    const fetchUser = `
      query fetchUser($input: UserQueryInput!) {
        user(userQueryInput: $input) {
          phone
          name
          address
        }
      }
    `;
    return this.client.request(fetchUser, {
      input: {
        id: userId
      }
    });

  }

  async updateUserInfo(userInfo) {
    const updateUserInfo = `
      mutation updateUser($input: UserUpdateInput!) {
        updateUser(userUpdateInput: $input) {
          id
          status
        }
      }
    `;
    return this.client.request(updateUserInfo, {
      input: {
        ...userInfo
      }
    });
  }
}
