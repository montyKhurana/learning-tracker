import { Context } from '../../index';
import { requireAuth, requireOwnership } from '../../auth/utils';

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

    notes: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.notesByTopicId.load(parent.id);
    },
  },
};

export default topicResolvers;
