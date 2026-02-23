import { Context } from '../../index';

/**
 * Note Resolvers — Mutations and Field resolvers
 *
 * No root Query — notes are accessed through Topic.notes
 */

const noteResolvers = {
  Mutation: {
    createNote: async (_parent: unknown, args: { input: any }, context: Context) => {
      return context.prisma.note.create({
        data: {
          content: args.input.content,
          topicId: args.input.topicId,
        },
      });
    },

    updateNote: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      return context.prisma.note.update({
        where: { id: args.id },
        data: { content: args.input.content },
      });
    },

    deleteNote: async (_parent: unknown, args: { id: string }, context: Context) => {
      return context.prisma.note.delete({
        where: { id: args.id },
      });
    },
  },

  Note: {
    topic: async (parent: any, _args: unknown, context: Context) => {
      return context.prisma.topic.findUnique({
        where: { id: parent.topicId },
      });
    },
  },
};

export default noteResolvers;
