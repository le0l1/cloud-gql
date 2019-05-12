import { SchemaDirectiveVisitor } from "graphql-tools";
import { defaultFieldResolver } from "graphql";

const roles = {
  CUSTOMER: 0,
  MERCHANT: 1,
  ROOT: 2
};

export class AuthDriective extends SchemaDirectiveVisitor {
  visitObject() {}
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { requires } = this.args;

    field.resolve = function(...args) {
      const context = args[2];
      if (context.currentUser.role < roles[requires]) {
        throw new Error("permissions denied");
      }

      return resolve.apply(this, args);
    };
  }
}
