import { Context } from '../../index';
import { requireAuth } from '../../auth/utils';

/**
 * Resource Resolvers — Mutations and Field resolvers
 */

const resourceResolvers = {
  Mutation: {
    createResource: async (_parent: unknown, args: { input: any }, context: Context) => {
      requireAuth(context);
      return context.prisma.resource.create({
        data: {
          title: args.input.title,
          url: args.input.url,
          type: args.input.type ?? 'ARTICLE',
          topicId: args.input.topicId,
        },
      });
    },

    updateResource: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      requireAuth(context);
      return context.prisma.resource.update({
        where: { id: args.id },
        data: args.input,
      });
    },

    deleteResource: async (_parent: unknown, args: { id: string }, context: Context) => {
      requireAuth(context);
      return context.prisma.resource.delete({
        where: { id: args.id },
      });
    },
  },

  Resource: {
    topic: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.topicById.load(parent.topicId);
    },
  },
};

export default resourceResolvers;
