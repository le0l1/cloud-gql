import CommentShema from "./Comment.gql";
import { Comment } from "./comment.entity";
import { formateID } from "../../helper/id";

const resolvers = {
  Mutation: {
    async createComment(_, { createCommentInput }) {
      const { id } = Comment.createComment(createCommentInput);
      return {
        id: formateID("comment", id),
        status: true
      };
    }
  }
};

export const comment = {
  typeDef: CommentShema,
  resolvers
};
