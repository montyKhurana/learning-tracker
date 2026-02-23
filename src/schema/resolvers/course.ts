import { Context } from '../../index';

/**
 * Course Resolvers — Queries, Mutations, and Field resolvers
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
      // In Phase 4, userId will come from the authenticated user in context.
      // For now, grab the first user from the DB.
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
        data: args.input,  // Only the fields the client sent get updated
      });
    },

    deleteCourse: async (_parent: unknown, args: { id: string }, context: Context) => {
      return context.prisma.course.delete({
        where: { id: args.id },
      });
    },
  },

  Course: {
    user: async (parent: any, _args: unknown, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },

    topics: async (parent: any, _args: unknown, context: Context) => {
      return context.prisma.topic.findMany({
        where: { courseId: parent.id },
        orderBy: { order: 'asc' },
      });
    },

    tags: async (parent: any, _args: unknown, context: Context) => {
      const courseTags = await context.prisma.courseTag.findMany({
        where: { courseId: parent.id },
        include: { tag: true },
      });
      return courseTags.map((ct: any) => ct.tag);
    },
  },
};

export default courseResolvers;
