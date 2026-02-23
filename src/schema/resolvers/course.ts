import { Context } from '../../index';

/**
 * Course Resolvers — Queries, Mutations, and Field resolvers
 *
 * Field resolvers now use DataLoaders instead of direct Prisma calls.
 * The Query and Mutation resolvers still use Prisma directly — DataLoaders
 * are only for the nested field resolution where N+1 happens.
 */

const courseResolvers = {
  Query: {
    // Top-level queries still use Prisma directly — no N+1 here
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
      const user = await context.prisma.user.findFirstOrThrow();

      return context.prisma.course.create({
        data: {
          title: args.input.title,
          description: args.input.description,
          userId: user.id,
        },
      });
    },

    updateCourse: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      return context.prisma.course.update({
        where: { id: args.id },
        data: args.input,
      });
    },

    deleteCourse: async (_parent: unknown, args: { id: string }, context: Context) => {
      return context.prisma.course.delete({
        where: { id: args.id },
      });
    },
  },

  Course: {
    // BEFORE: context.prisma.user.findUnique({ where: { id: parent.userId } })
    // AFTER:  context.loaders.userById.load(parent.userId)
    // If 4 courses have the same userId, this fires ONE query instead of 4
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
