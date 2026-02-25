import { Context } from '../../index';
import { requireAuth } from '../../auth/utils';

/**
 * User Resolvers
 *
 * Field-level authorization:
 * - email: only visible to the user themselves (returns null for other users)
 *
 * This matters when User objects appear in nested queries.
 * e.g. { course(id: "...") { user { name email } } }
 * If you're not that user, you'll see their name but email will be null.
 */

const userResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      return requireAuth(context);
    },
  },

  User: {
    // Field-level auth: email is only visible to the owner
    email: (parent: any, _args: unknown, context: Context) => {
      if (context.user && context.user.id === parent.id) {
        return parent.email;
      }
      return null;
    },

    courses: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.coursesByUserId.load(parent.id);
    },
  },
};

export default userResolvers;
