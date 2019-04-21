export default {
  Query: {
    merchant: (_, { id = 1, name = "leo", phone = 17821230123 }) => ({ id }),
    merchantList: (_, { page = 1, pageSize = 20 }) => ({
      page,
      pageSize,
      total: 20,
      merchants: []
    })
  },
  Merchant: {
    id: result => {
      return result.id + 1;
    },
    name: res => {
      return "123";
    },
    qqchat: () => 123,
    wechat: () => "asd",
    phone: () => 123,
    description: () => "asd"
  }
};
