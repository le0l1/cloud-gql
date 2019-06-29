import CommentShema from './Comment.graphql';
import { Comment } from './comment.entity';
import { formateID } from '../../helper/util';

const resolvers = {
  Mutation: {
    async createComment(_, { createCommentInput }) {
      const { id } = await Comment.createComment(createCommentInput);
      return {
        id: formateID('comment', id),
        status: true,
      };
    },
  },
  Query: {
    comments(_, { query }) {
      return Comment.getCommentList(query);
    },
  },
  CommentConnection: {
    edges(v) {
      return v[0] || [];
    },
    pageInfo(v) {
      return v;
    },
  },
};

export const comment = {
  typeDef: CommentShema,
  resolvers,
};
