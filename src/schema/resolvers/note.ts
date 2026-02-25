import { Context } from '../../index';
import { requireOwnership } from '../../auth/utils';

/**
 * Note Resolvers
 *
 * Ownership chain: Note → Topic → Course → User
 */

const noteResolvers = {
  Mutation: {
    createNote: async (_parent: unknown, args: { input: any }, context: Context) => {
      const topic = await context.prisma.topic.findUniqueOrThrow({
        where: { id: args.input.topicId },
        include: { course: true },
      });
      requireOwnership(topic.course.userId, context);

      return context.prisma.note.create({
        data: {
          content: args.input.content,
          topicId: args.input.topicId,
        },
      });
    },

    updateNote: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      const note = await context.prisma.note.findUniqueOrThrow({
        where: { id: args.id },
        include: { topic: { include: { course: true } } },
      });
      requireOwnership(note.topic.course.userId, context);

      return context.prisma.note.update({
        where: { id: args.id },
        data: { content: args.input.content },
      });
    },

    deleteNote: async (_parent: unknown, args: { id: string }, context: Context) => {
      const note = await context.prisma.note.findUniqueOrThrow({
        where: { id: args.id },
        include: { topic: { include: { course: true } } },
      });
      requireOwnership(note.topic.course.userId, context);

      return context.prisma.note.delete({
        where: { id: args.id },
      });
    },
  },

  Note: {
    topic: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.topicById.load(parent.topicId);
    },
  },
};

export default noteResolvers;
