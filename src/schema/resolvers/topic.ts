import { Context } from '../../index';
import { requireAuth, requireOwnership } from '../../auth/utils';
import { PaginationArgs, clampFirst, decodeCursor, buildConnection } from '../../utils/pagination';

/**
 * Topic Resolvers
 *
 * Ownership: Topic belongs to a Course, which belongs to a User.
 * To check ownership, we look up the parent course and verify course.userId.
 */

const topicResolvers = {
  Query: {
    topic: async (_parent: unknown, args: { id: string }, context: Context) => {
      return context.prisma.topic.findUnique({
        where: { id: args.id },
      });
    },
  },

  Mutation: {
    createTopic: async (_parent: unknown, args: { input: any }, context: Context) => {
      // Verify the user owns the course they're adding a topic to
      const course = await context.prisma.course.findUniqueOrThrow({
        where: { id: args.input.courseId },
      });
      requireOwnership(course.userId, context);

      return context.prisma.topic.create({
        data: {
          title: args.input.title,
          courseId: args.input.courseId,
          order: args.input.order ?? 0,
        },
      });
    },

    updateTopic: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      // Topic → Course → check userId
      const topic = await context.prisma.topic.findUniqueOrThrow({
        where: { id: args.id },
        include: { course: true },
      });
      requireOwnership(topic.course.userId, context);

      return context.prisma.topic.update({
        where: { id: args.id },
        data: args.input,
      });
    },

    deleteTopic: async (_parent: unknown, args: { id: string }, context: Context) => {
      const topic = await context.prisma.topic.findUniqueOrThrow({
        where: { id: args.id },
        include: { course: true },
      });
      requireOwnership(topic.course.userId, context);

      return context.prisma.topic.delete({
        where: { id: args.id },
      });
    },
  },

  Topic: {
    course: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.courseById.load(parent.courseId);
    },

    resources: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.resourcesByTopicId.load(parent.id);
    },

    resourcesConnection: async (
      parent: any,
      args: PaginationArgs & { filter?: { type?: string }; sortOrder?: string },
      context: Context,
    ) => {
      const first = clampFirst(args.first);
      const orderDirection = args.sortOrder === 'ASC' ? 'asc' : 'desc';

      const where: any = { topicId: parent.id };
      if (args.filter?.type) {
        where.type = args.filter.type;
      }
      if (args.after) {
        const cursorDate = decodeCursor(args.after);
        where.createdAt = orderDirection === 'desc' ? { lt: cursorDate } : { gt: cursorDate };
      }

      const [items, totalCount] = await Promise.all([
        context.prisma.resource.findMany({
          where,
          orderBy: { createdAt: orderDirection },
          take: first + 1,
        }),
        context.prisma.resource.count({ where: { ...where, createdAt: undefined } }),
      ]);

      const hasPreviousPage = !!args.after;
      return buildConnection(items, first, totalCount, hasPreviousPage);
    },

    notes: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.notesByTopicId.load(parent.id);
    },
  },
};

export default topicResolvers;
