import { Context } from '../../index';
import { requireAuth } from '../../auth/utils';

/**
 * Tag Resolvers — Queries, Mutations, and Field resolvers
 */

const tagResolvers = {
  Query: {
    tags: async (_parent: unknown, _args: unknown, context: Context) => {
      return context.prisma.tag.findMany({
        orderBy: { name: 'asc' },
      });
    },
  },

  Mutation: {
    addTagToCourse: async (
      _parent: unknown,
      args: { courseId: string; tagName: string },
      context: Context
    ) => {
      requireAuth(context);
      const tag = await context.prisma.tag.upsert({
        where: { name: args.tagName },
        update: {},
        create: { name: args.tagName },
      });

      await context.prisma.courseTag.upsert({
        where: {
          courseId_tagId: {
            courseId: args.courseId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          courseId: args.courseId,
          tagId: tag.id,
        },
      });

      return context.prisma.course.findUniqueOrThrow({
        where: { id: args.courseId },
      });
    },

    removeTagFromCourse: async (
      _parent: unknown,
      args: { courseId: string; tagId: string },
      context: Context
    ) => {
      requireAuth(context);
      await context.prisma.courseTag.delete({
        where: {
          courseId_tagId: {
            courseId: args.courseId,
            tagId: args.tagId,
          },
        },
      });

      return context.prisma.course.findUniqueOrThrow({
        where: { id: args.courseId },
      });
    },
  },

  Tag: {
    courses: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.coursesByTagId.load(parent.id);
    },
  },
};

export default tagResolvers;
