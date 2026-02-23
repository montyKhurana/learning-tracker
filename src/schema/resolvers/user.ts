import { Context } from '../../index';

/**
 * User Resolvers — Queries and Field resolvers
 */

const userResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      return context.prisma.user.findFirst();
    },
  },

  User: {
    courses: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.coursesByUserId.load(parent.id);
    },
  },
};

export default userResolvers;
