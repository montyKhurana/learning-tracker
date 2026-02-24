import { Context } from '../../index';
import { requireAuth } from '../../auth/utils';

/**
 * Topic Resolvers — Queries, Mutations, and Field resolvers
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
      requireAuth(context);
      return context.prisma.topic.create({
        data: {
          title: args.input.title,
          courseId: args.input.courseId,
          order: args.input.order ?? 0,
        },
      });
    },

    updateTopic: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      requireAuth(context);
      return context.prisma.topic.update({
        where: { id: args.id },
        data: args.input,
      });
    },

    deleteTopic: async (_parent: unknown, args: { id: string }, context: Context) => {
      requireAuth(context);
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
