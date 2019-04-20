export default {
  Query: {
    hello: () => {
      return { name: "123" };
    }
  },
  Hello: {
    name: (obj, args, context, info) => {
      return obj.name + "asd";
    }
  }
};
