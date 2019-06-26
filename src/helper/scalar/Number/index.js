import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const numberResolver = {
  Number: new GraphQLScalarType({
    name: 'Number',
    description: 'Number custom scalar type',
    serialize: v => Number(v),
    parseValue(v) {
      if (isNaN(v)) {
        throw new Error(`${ast.value} is not a valid number`);
      }
      return v;
    },
    parseLiteral(ast) {
      if (ast.kind !== Kind.INT) {
        throw new Error(`${ast.value} is not a valid number`);
      }
      return ast.value;
    },
  }),
};
