import CollectionSchema from './Collection.graphql';
import CollectionResolver from './collection';

const resolvers = {
  Query: {
    collections(_, { query }) {
      return CollectionResolver.searchCollections(query);
    },
  },
  Mutation: {
    createCollection(_, { createCollectionInput }) {
      return CollectionResolver.createCollection(createCollectionInput);
    },
    deleteCollection(_, { deleteCollectionInput }) {
      return CollectionResolver.deleteCollection(deleteCollectionInput);
    },
  },
  CollectionActionResult: {
    status: () => true,
  },
  Collection: {
    __resolveType(v) {
      return v.constructor.name;
    },
  },
};
export default {
  typeDef: CollectionSchema,
  resolvers,
};
