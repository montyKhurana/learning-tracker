import { Context } from '../../index';

/**
 * User Resolvers
 *
 * Query.me      — returns the currently authenticated user (placeholder until Phase 4)
 * User.courses  — all courses belonging to this user
 */

const userResolvers = {
  Query: {
    // Placeholder: In Phase 4, we'll extract the user from the JWT token in context.
    // For now, return the first user in the database so we can test the schema.
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      return context.prisma.user.findFirst();
    },
  },

  User: {
    courses: async (parent: any, _args: unknown, context: Context) => {
      return context.prisma.course.findMany({
        where: { userId: parent.id },
      });
    },
  },
};

export default userResolvers;
