import VideoSchema from './Video.graphql';
import {
  createVideo, deleteVideo, searchVideo, searchVideos,
} from './video';
import { idResolver } from '../../helper/resolver';
import { formateID } from '../../helper/util';

const resolvers = {
  Query: {
    video(_, { id }) {
      return searchVideo(id);
    },
    videos(_, { query = {} }) {
      return searchVideos(query);
    },
  },
  Mutation: {
    createVideo(_, { input }) {
      return createVideo(input);
    },
    deleteVideo(_, { id }) {
      return deleteVideo(id);
    },
  },
  Video: {
    ...idResolver('video'),
    userId(v) {
      return formateID('user', v.userId);
    },
  },
  VideoNode: idResolver('video'),
  VideoConnection: {
    edges(v) {
      return v[0];
    },
    pageInfo(v) {
      return v;
    },
  },
};

export default {
  typeDef: VideoSchema,
  resolvers,
};
