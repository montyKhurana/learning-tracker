import { Context } from '../../index';
import { requireAuth, requireOwnership } from '../../auth/utils';
import { PaginationArgs, clampFirst, decodeCursor, buildConnection } from '../../utils/pagination';

/**
 * Course Resolvers
 *
 * Authorization rules:
 * - courses query: returns only the authenticated user's courses
 * - course(id): public (anyone can view a course by ID)
 * - createCourse: requires auth (creates under authenticated user)
 * - updateCourse: requires auth + ownership (only course owner can edit)
 * - deleteCourse: requires auth + ownership (only course owner can delete)
 */

const courseResolvers = {
  Query: {
    // Now scoped to the authenticated user — returns only YOUR courses
    courses: async (_parent: unknown, _args: unknown, context: Context) => {
      const user = requireAuth(context);
      return context.prisma.course.findMany({
           where: { userId: user.id},
        });
    },

    coursesConnection: async (
      _parent: unknown,
      args: PaginationArgs & { filter?: { status?: string; titleContains?: string }; sortOrder?: string },
      context: Context,
    ) => {
      const user = requireAuth(context);
      const first = clampFirst(args.first);
      const orderDirection = args.sortOrder === 'ASC' ? 'asc' : 'desc';

      // Build the where clause from filters + cursor
      const where: any = { userId: user.id };
      if (args.filter?.status) {
        where.status = args.filter.status;
      }
      if (args.filter?.titleContains) {
        where.title = { contains: args.filter.titleContains, mode: 'insensitive' };
      }
      if (args.after) {
        const cursorDate = decodeCursor(args.after);
        where.createdAt = orderDirection === 'desc' ? { lt: cursorDate } : { gt: cursorDate };
      }

      // Run findMany (N+1) and count in parallel
      const [items, totalCount] = await Promise.all([
        context.prisma.course.findMany({
          where,
          orderBy: { createdAt: orderDirection },
          take: first + 1,
        }),
        context.prisma.course.count({ where: { ...where, createdAt: undefined } }),
      ]);

      const hasPreviousPage = !!args.after;
      return buildConnection(items, first, totalCount, hasPreviousPage);
    },

    course: async (_parent: unknown, args: { id: string }, context: Context) => {
      return context.prisma.course.findUnique({
        where: { id: args.id },
      });
    },
  },

  Mutation: {
    createCourse: async (_parent: unknown, args: { input: any }, context: Context) => {
      const user = requireAuth(context);

      return context.prisma.course.create({
        data: {
          title: args.input.title,
          description: args.input.description,
          userId: user.id,
        },
      });
    },

    updateCourse: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      // First fetch the course to check ownership
      const course = await context.prisma.course.findUniqueOrThrow({
        where: { id: args.id },
      });
      requireOwnership(course.userId, context);

      return context.prisma.course.update({
        where: { id: args.id },
        data: args.input,
      });
    },

    deleteCourse: async (_parent: unknown, args: { id: string }, context: Context) => {
      const course = await context.prisma.course.findUniqueOrThrow({
        where: { id: args.id },
      });
      requireOwnership(course.userId, context);

      return context.prisma.course.delete({
        where: { id: args.id },
      });
    },
  },

  Course: {
    user: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.userById.load(parent.userId);
    },

    topics: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.topicsByCourseId.load(parent.id);
    },

    topicsConnection: async (
      parent: any,
      args: PaginationArgs & { filter?: { status?: string }; sortOrder?: string },
      context: Context,
    ) => {
      const first = clampFirst(args.first);
      const orderDirection = args.sortOrder === 'ASC' ? 'asc' : 'desc';
      const where: any = { courseId: parent.id };
      if (args.filter?.status) {
        where.status = args.filter.status;
      }
      if (args.after) {
        const cursorDate = decodeCursor(args.after);
        where.createdAt = orderDirection === 'desc' ? { lt: cursorDate } : { gt: cursorDate };
      }

      const [items, totalCount] = await Promise.all([
        context.prisma.topic.findMany({
          where,
          orderBy: { createdAt: orderDirection },
          take: first + 1,
        }),
        context.prisma.topic.count({ where: { ...where, createdAt: undefined } }),
      ]);

      const hasPreviousPage = !!args.after;
      return buildConnection(items, first, totalCount, hasPreviousPage);
    },

    tags: (parent: any, _args: unknown, context: Context) => {
      return context.loaders.tagsByCourseId.load(parent.id);
    },
  },
};

export default courseResolvers;
