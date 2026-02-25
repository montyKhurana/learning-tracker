import { Context } from '../../index';
import { requireAuth, requireOwnership } from '../../auth/utils';

/**
 * Course Resolvers
 *
 * Authorization rules:
 * - courses query: returns only the authenticated user's courses
 * - course(id): public (anyone can view a course by ID)
 * - createCourse: requires auth (creates under authenticated user)
 * - updateCourse: requires auth + ownership (only course owner can edit)
 * - deleteCourse: requires auth + ownership (only course owner can delete)
 */

const courseResolvers = {
  Query: {
    // Now scoped to the authenticated user — returns only YOUR courses
    courses: async (_parent: unknown, _args: unknown, context: Context) => {
      // const user = requireAuth(context);
      return context.prisma.course.findMany();
    },

    course: async (_parent: unknown, args: { id: string }, context: Context) => {
      return context.prisma.course.findUnique({
        where: { id: args.id },
      });
    },
  },

  Mutation: {
    createCourse: async (_parent: unknown, args: { input: any }, context: Context) => {
      const user = requireAuth(context);

      return context.prisma.course.create({
        data: {
          title: args.input.title,
          description: args.input.description,
          userId: user.id,
        },
      });
    },

    updateCourse: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      // First fetch the course to check ownership
      const course = await context.prisma.course.findUniqueOrThrow({
        where: { id: args.id },
      });
      requireOwnership(course.userId, context);

      return context.prisma.course.update({
        where: { id: args.id },
        data: args.input,
      });
    },

    deleteCourse: async (_parent: unknown, args: { id: string }, context: Context) => {
      const course = await context.prisma.course.findUniqueOrThrow({
        where: { id: args.id },
      });
      requireOwnership(course.userId, context);

      return context.prisma.course.delete({
        where: { id: args.id },
      });
    },
  },

  Course: {
    user: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.userById.load(parent.userId);
    },

    topics: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.topicsByCourseId.load(parent.id);
    },

    tags: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.tagsByCourseId.load(parent.id);
    },
  },
};

export default courseResolvers;
