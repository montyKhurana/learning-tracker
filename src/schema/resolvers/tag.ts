import { Context } from '../../index';

/**
 * Tag Resolvers — Queries, Mutations, and Field resolvers
 *
 * Tag mutations are different from the rest — instead of full CRUD,
 * we have "add tag to course" and "remove tag from course".
 *
 * addTagToCourse uses a "find-or-create" pattern:
 * - If a tag with that name already exists, reuse it
 * - If not, create a new tag
 * - Then link it to the course via the join table
 *
 * This is a common pattern for tags/labels in any application.
 */

const tagResolvers = {
  Query: {
    tags: async (_parent: unknown, _args: unknown, context: Context) => {
      return context.prisma.tag.findMany({
        orderBy: { name: 'asc' },
      });
    },
  },

  Mutation: {
    addTagToCourse: async (
      _parent: unknown,
      args: { courseId: string; tagName: string },
      context: Context
    ) => {
      // Find or create the tag
      const tag = await context.prisma.tag.upsert({
        where: { name: args.tagName },
        update: {},             // Tag exists — do nothing
        create: { name: args.tagName },  // Tag doesn't exist — create it
      });

      // Link tag to course (ignore if already linked)
      await context.prisma.courseTag.upsert({
        where: {
          courseId_tagId: {
            courseId: args.courseId,
            tagId: tag.id,
          },
        },
        update: {},             // Already linked — do nothing
        create: {
          courseId: args.courseId,
          tagId: tag.id,
        },
      });

      // Return the updated course (mutation convention)
      return context.prisma.course.findUniqueOrThrow({
        where: { id: args.courseId },
      });
    },

    removeTagFromCourse: async (
      _parent: unknown,
      args: { courseId: string; tagId: string },
      context: Context
    ) => {
      // Delete the link (not the tag itself — other courses might use it)
      await context.prisma.courseTag.delete({
        where: {
          courseId_tagId: {
            courseId: args.courseId,
            tagId: args.tagId,
          },
        },
      });

      return context.prisma.course.findUniqueOrThrow({
        where: { id: args.courseId },
      });
    },
  },

  Tag: {
    courses: async (parent: any, _args: unknown, context: Context) => {
      const courseTags = await context.prisma.courseTag.findMany({
        where: { tagId: parent.id },
        include: { course: true },
      });
      return courseTags.map((ct: any) => ct.course);
    },
  },
};

export default tagResolvers;
