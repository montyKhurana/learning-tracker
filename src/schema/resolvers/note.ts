import { Context } from '../../index';
import { requireAuth } from '../../auth/utils';

/**
 * Note Resolvers — Mutations and Field resolvers
 */

const noteResolvers = {
  Mutation: {
    createNote: async (_parent: unknown, args: { input: any }, context: Context) => {
      requireAuth(context);
      return context.prisma.note.create({
        data: {
          content: args.input.content,
          topicId: args.input.topicId,
        },
      });
    },

    updateNote: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      requireAuth(context);
      return context.prisma.note.update({
        where: { id: args.id },
        data: { content: args.input.content },
      });
    },

    deleteNote: async (_parent: unknown, args: { id: string }, context: Context) => {
      requireAuth(context);
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
