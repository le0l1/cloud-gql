import CommentShema from './Comment.graphql';
import CommentResolver from './comment';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Mutation: {
    createComment(_, { createCommentInput }) {
      return CommentResolver.createComment(createCommentInput);
    },
    deleteComment(_, { deleteCommentInput }) {
      return CommentResolver.deleteComment(deleteCommentInput);
    },
  },
  Query: {
    comments(_, { query }) {
      return CommentResolver.searchComment(query);
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
  Comment: idResolver('comment'),
  CommentResult: {
    ...idResolver('comment'),
    status: () => true,
  },
};

export const comment = {
  typeDef: CommentShema,
  resolvers,
};
