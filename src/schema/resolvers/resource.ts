import { Context } from '../../index';

/**
 * Resource Resolvers — Mutations and Field resolvers
 *
 * No root Query — resources are accessed through Topic.resources
 */

const resourceResolvers = {
  Mutation: {
    createResource: async (_parent: unknown, args: { input: any }, context: Context) => {
      return context.prisma.resource.create({
        data: {
          title: args.input.title,
          url: args.input.url,
          type: args.input.type ?? 'ARTICLE',  // Default to ARTICLE
          topicId: args.input.topicId,
        },
      });
    },

    updateResource: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      return context.prisma.resource.update({
        where: { id: args.id },
        data: args.input,
      });
    },

    deleteResource: async (_parent: unknown, args: { id: string }, context: Context) => {
      return context.prisma.resource.delete({
        where: { id: args.id },
      });
    },
  },

  Resource: {
    topic: async (parent: any, _args: unknown, context: Context) => {
      return context.prisma.topic.findUnique({
        where: { id: parent.topicId },
      });
    },
  },
};

export default resourceResolvers;
