import authResolvers from './auth';
import courseResolvers from './course';
import topicResolvers from './topic';
import userResolvers from './user';
import tagResolvers from './tag';
import resourceResolvers from './resource';
import noteResolvers from './note';

/**
 * Resolver Index — merges all domain-specific resolvers into one object
 *
 * Same pattern as before, but now we also merge Mutation resolvers.
 * Apollo expects: { Query: {...}, Mutation: {...}, Course: {...}, ... }
 */

const resolvers = {
  Query: {
    hello: () => 'Hello from Learning Tracker GraphQL API!',
    ...userResolvers.Query,
    ...courseResolvers.Query,
    ...topicResolvers.Query,
    ...tagResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...courseResolvers.Mutation,
    ...topicResolvers.Mutation,
    ...resourceResolvers.Mutation,
    ...noteResolvers.Mutation,
    ...tagResolvers.Mutation,
  },

  User: {
    ...userResolvers.User,
  },

  Course: {
    ...courseResolvers.Course,
  },

  Topic: {
    ...topicResolvers.Topic,
  },

  Resource: {
    ...resourceResolvers.Resource,
  },

  Note: {
    ...noteResolvers.Note,
  },

  Tag: {
    ...tagResolvers.Tag,
  },
};

export default resolvers;
