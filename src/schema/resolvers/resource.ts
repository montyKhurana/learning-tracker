import { Context } from '../../index';
import { requireOwnership } from '../../auth/utils';

/**
 * Resource Resolvers
 *
 * Ownership chain: Resource → Topic → Course → User
 * We walk up two levels to verify ownership.
 */

const resourceResolvers = {
  Mutation: {
    createResource: async (_parent: unknown, args: { input: any }, context: Context) => {
      // Topic → Course → check userId
      const topic = await context.prisma.topic.findUniqueOrThrow({
        where: { id: args.input.topicId },
        include: { course: true },
      });
      requireOwnership(topic.course.userId, context);

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
      // Resource → Topic → Course → check userId
      const resource = await context.prisma.resource.findUniqueOrThrow({
        where: { id: args.id },
        include: { topic: { include: { course: true } } },
      });
      requireOwnership(resource.topic.course.userId, context);

      return context.prisma.resource.update({
        where: { id: args.id },
        data: args.input,
      });
    },

    deleteResource: async (_parent: unknown, args: { id: string }, context: Context) => {
      const resource = await context.prisma.resource.findUniqueOrThrow({
        where: { id: args.id },
        include: { topic: { include: { course: true } } },
      });
      requireOwnership(resource.topic.course.userId, context);

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
