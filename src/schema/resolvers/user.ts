import { GraphQLError } from 'graphql';
import { Context } from '../../index';

/**
 * User Resolvers — Queries and Field resolvers
 *
 * The `me` query now returns the actual authenticated user from context.
 * If no valid JWT is provided, context.user is null → we throw an error.
 */

const userResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return context.user;
    },
  },

  User: {
    courses: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.coursesByUserId.load(parent.id);
    },
  },
};

export default userResolvers;
