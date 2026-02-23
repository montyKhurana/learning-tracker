import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

/**
 * DataLoader Factory — creates a fresh set of DataLoaders
 *
 * IMPORTANT: Why a factory function and not just global loaders?
 * DataLoader caches results per key. If we shared loaders across requests:
 * - User A creates a topic → cached
 * - User B queries topics → gets stale cached data (doesn't see User A's new topic)
 *
 * By creating new loaders PER REQUEST, each request gets a clean cache.
 * Within a single request, the cache prevents duplicate queries (if the same
 * courseId is needed twice in one request, it only queries once).
 *
 * HOW A BATCH FUNCTION WORKS:
 * 1. DataLoader collects all keys requested in the same event loop tick
 *    e.g. keys = ["courseId-1", "courseId-2", "courseId-3"]
 *
 * 2. It calls your batch function ONCE with all keys
 *
 * 3. Your batch function must return an array in THE SAME ORDER as the keys
 *    e.g. keys = ["aaa", "bbb", "ccc"]
 *         return = [topicsForAaa, topicsForBbb, topicsForCcc]
 *
 * 4. DataLoader distributes each result back to the resolver that requested it
 */

export function createDataLoaders(prisma: PrismaClient) {
  return {
    // ─── Topics by courseId ───
    // Used by: Course.topics resolver
    // Instead of: SELECT * FROM topics WHERE courseId = ? (one per course)
    // Becomes:    SELECT * FROM topics WHERE courseId IN (?, ?, ?) (one query)
    topicsByCourseId: new DataLoader<string, any[]>(async (courseIds) => {
      const topics = await prisma.topic.findMany({
        where: { courseId: { in: [...courseIds] } },
        orderBy: { order: 'asc' },
      });

      // Group topics by courseId, then return in the same order as input keys
      const topicMap = new Map<string, any[]>();
      for (const topic of topics) {
        const existing = topicMap.get(topic.courseId) || [];
        existing.push(topic);
        topicMap.set(topic.courseId, existing);
      }

      // Return in order: for each courseId, return its topics (or empty array)
      return courseIds.map((id) => topicMap.get(id) || []);
    }),

    // ─── Tags by courseId ───
    // Used by: Course.tags resolver
    // Navigates the join table: courseId → course_tags → tags
    tagsByCourseId: new DataLoader<string, any[]>(async (courseIds) => {
      const courseTags = await prisma.courseTag.findMany({
        where: { courseId: { in: [...courseIds] } },
        include: { tag: true },
      });

      const tagMap = new Map<string, any[]>();
      for (const ct of courseTags) {
        const existing = tagMap.get(ct.courseId) || [];
        existing.push(ct.tag);
        tagMap.set(ct.courseId, existing);
      }

      return courseIds.map((id) => tagMap.get(id) || []);
    }),

    // ─── Resources by topicId ───
    // Used by: Topic.resources resolver
    resourcesByTopicId: new DataLoader<string, any[]>(async (topicIds) => {
      const resources = await prisma.resource.findMany({
        where: { topicId: { in: [...topicIds] } },
      });

      const resourceMap = new Map<string, any[]>();
      for (const resource of resources) {
        const existing = resourceMap.get(resource.topicId) || [];
        existing.push(resource);
        resourceMap.set(resource.topicId, existing);
      }

      return topicIds.map((id) => resourceMap.get(id) || []);
    }),

    // ─── Notes by topicId ───
    // Used by: Topic.notes resolver
    notesByTopicId: new DataLoader<string, any[]>(async (topicIds) => {
      const notes = await prisma.note.findMany({
        where: { topicId: { in: [...topicIds] } },
      });

      const noteMap = new Map<string, any[]>();
      for (const note of notes) {
        const existing = noteMap.get(note.topicId) || [];
        existing.push(note);
        noteMap.set(note.topicId, existing);
      }

      return topicIds.map((id) => noteMap.get(id) || []);
    }),

    // ─── User by userId ───
    // Used by: Course.user resolver
    // This is a one-to-one loader (one userId → one user), not one-to-many
    userById: new DataLoader<string, any>(async (userIds) => {
      const users = await prisma.user.findMany({
        where: { id: { in: [...userIds] } },
      });

      const userMap = new Map<string, any>();
      for (const user of users) {
        userMap.set(user.id, user);
      }

      // Return in order (single user per key, not an array)
      return userIds.map((id) => userMap.get(id) || null);
    }),

    // ─── Course by courseId ───
    // Used by: Topic.course resolver
    courseById: new DataLoader<string, any>(async (courseIds) => {
      const courses = await prisma.course.findMany({
        where: { id: { in: [...courseIds] } },
      });

      const courseMap = new Map<string, any>();
      for (const course of courses) {
        courseMap.set(course.id, course);
      }

      return courseIds.map((id) => courseMap.get(id) || null);
    }),

    // ─── Topic by topicId ───
    // Used by: Resource.topic, Note.topic resolvers
    topicById: new DataLoader<string, any>(async (topicIds) => {
      const topics = await prisma.topic.findMany({
        where: { id: { in: [...topicIds] } },
      });

      const topicMap = new Map<string, any>();
      for (const topic of topics) {
        topicMap.set(topic.id, topic);
      }

      return topicIds.map((id) => topicMap.get(id) || null);
    }),

    // ─── Courses by tagId ───
    // Used by: Tag.courses resolver
    coursesByTagId: new DataLoader<string, any[]>(async (tagIds) => {
      const courseTags = await prisma.courseTag.findMany({
        where: { tagId: { in: [...tagIds] } },
        include: { course: true },
      });

      const courseMap = new Map<string, any[]>();
      for (const ct of courseTags) {
        const existing = courseMap.get(ct.tagId) || [];
        existing.push(ct.course);
        courseMap.set(ct.tagId, existing);
      }

      return tagIds.map((id) => courseMap.get(id) || []);
    }),

    // ─── Courses by userId ───
    // Used by: User.courses resolver
    coursesByUserId: new DataLoader<string, any[]>(async (userIds) => {
      const courses = await prisma.course.findMany({
        where: { userId: { in: [...userIds] } },
      });

      const courseMap = new Map<string, any[]>();
      for (const course of courses) {
        const existing = courseMap.get(course.userId) || [];
        existing.push(course);
        courseMap.set(course.userId, existing);
      }

      return userIds.map((id) => courseMap.get(id) || []);
    }),
  };
}

// Export the type so we can use it in Context
export type DataLoaders = ReturnType<typeof createDataLoaders>;
