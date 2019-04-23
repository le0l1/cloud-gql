import { SchemaDirectiveVisitor } from "graphql-tools";
import { defaultFieldResolver } from "graphql";

export class AuthDriective extends SchemaDirectiveVisitor {
  visitObject() {
    console.log(this);
  }
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = function(...args) {
      const context = args[2];
      if (!context.currentUser || !context.token) {
        throw new Error("permissions denied");
      }
      return resolve.apply(this, args);
    };
  }
}
