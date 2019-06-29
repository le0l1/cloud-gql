import { SchemaDirectiveVisitor } from 'graphql-tools';
import { defaultFieldResolver } from 'graphql';

const roles = {
  CUSTOMER: 0,
  MERCHANT: 1,
  ROOT: 2,
};

export class AuthDriective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { requires } = this.args;
    field.description += '(需要权限)';
    field.resolve = function resolver(...args) {
      const context = args[2];
      if (context.currentUser && context.currentUser.role < roles[requires]) {
        throw new Error('账号权限不足');
      }

      return resolve.apply(this, args);
    };
  }
}