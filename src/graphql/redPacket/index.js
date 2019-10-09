import RedPacketSchema from './RedPacket.graphql';
import RedPacketResolver from './redPacket';
import { idResolver } from '../../helper/resolver';

const resolvers = {
  Query: {
    redPacket(_, { id }) {
      return RedPacketResolver.searchRedPacket(id);
    },
    redPackets() {
      return RedPacketResolver.searchRedPackets();
    },
  },
  Mutation: {
    sendRedPacket(_, { input }, { currentUser }) {
      return RedPacketResolver.sendRedPacket(currentUser, input);
    },
    grabRedPacket(_, { input }, { currentUser }) {
      return RedPacketResolver.grabRedPacket(currentUser, input);
    },
  },
  RedPacket: idResolver('redpacket'),
};

export default {
  typeDef: RedPacketSchema,
  resolvers,
};
