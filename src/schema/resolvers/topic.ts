import { Context } from '../../index';

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
      return context.prisma.topic.create({
        data: {
          title: args.input.title,
          courseId: args.input.courseId,
          order: args.input.order ?? 0,  // Default to 0 if not provided
        },
      });
    },

    updateTopic: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      return context.prisma.topic.update({
        where: { id: args.id },
        data: args.input,
      });
    },

    deleteTopic: async (_parent: unknown, args: { id: string }, context: Context) => {
      return context.prisma.topic.delete({
        where: { id: args.id },
      });
    },
  },

  Topic: {
    course: async (parent: any, _args: unknown, context: Context) => {
      return context.prisma.course.findUnique({
        where: { id: parent.courseId },
      });
    },

    resources: async (parent: any, _args: unknown, context: Context) => {
      return context.prisma.resource.findMany({
        where: { topicId: parent.id },
      });
    },

    notes: async (parent: any, _args: unknown, context: Context) => {
      return context.prisma.note.findMany({
        where: { topicId: parent.id },
      });
    },
  },
};

export default topicResolvers;
