import { Context } from '../../index';
import { requireAuth } from '../../auth/utils';

/**
 * Course Resolvers — Queries, Mutations, and Field resolvers
 *
 * Mutations require authentication — context.user must exist.
 * Queries remain public for now (Phase 5 will add ownership checks).
 */

const courseResolvers = {
  Query: {
    courses: async (_parent: unknown, _args: unknown, context: Context) => {
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
      requireAuth(context);
      return context.prisma.course.update({
        where: { id: args.id },
        data: args.input,
      });
    },

    deleteCourse: async (_parent: unknown, args: { id: string }, context: Context) => {
      requireAuth(context);
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
