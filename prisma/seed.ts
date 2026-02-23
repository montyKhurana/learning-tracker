/**
 * Seed Script — populates the database with sample data
 *
 * Run with: npx prisma db seed
 *
 * This creates:
 * - 1 user (we'll add auth later, for now just a test user)
 * - 3 courses with topics, resources, and notes
 * - Several tags linked to courses
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data (in reverse dependency order)
  await prisma.courseTag.deleteMany();
  await prisma.note.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned existing data.');

  // Create a test user (password will be hashed in Phase 4)
  const user = await prisma.user.create({
    data: {
      email: 'learner@example.com',
      name: 'Test Learner',
      password: 'placeholder', // Will use bcrypt in Phase 4
    },
  });
  console.log(`Created user: ${user.name}`);

  // Create tags
  const tags = await Promise.all(
    ['graphql', 'typescript', 'backend', 'frontend', 'database', 'node'].map(
      (name) => prisma.tag.create({ data: { name } })
    )
  );
  console.log(`Created ${tags.length} tags.`);

  const tagMap = Object.fromEntries(tags.map((t) => [t.name, t.id]));

  // ---- Course 1: GraphQL Mastery ----
  const graphqlCourse = await prisma.course.create({
    data: {
      title: 'GraphQL Mastery',
      description: 'Learn GraphQL from basics to advanced patterns including Apollo Server, subscriptions, and DataLoader.',
      status: 'IN_PROGRESS',
      userId: user.id,
      topics: {
        create: [
          {
            title: 'Schema Design & SDL',
            order: 1,
            status: 'COMPLETED',
            resources: {
              create: [
                { title: 'GraphQL Official Docs - Schema', url: 'https://graphql.org/learn/schema/', type: 'DOCUMENTATION' },
                { title: 'Apollo Schema Best Practices', url: 'https://www.apollographql.com/docs/apollo-server/schema/schema/', type: 'ARTICLE' },
              ],
            },
            notes: {
              create: [
                { content: 'GraphQL schema uses SDL (Schema Definition Language). Types define the shape of data, and resolvers provide the actual data.' },
              ],
            },
          },
          {
            title: 'Resolvers & Data Fetching',
            order: 2,
            status: 'IN_PROGRESS',
            resources: {
              create: [
                { title: 'Resolvers - Apollo Docs', url: 'https://www.apollographql.com/docs/apollo-server/data/resolvers/', type: 'DOCUMENTATION' },
                { title: 'GraphQL Resolvers Deep Dive', url: 'https://www.youtube.com/watch?v=example1', type: 'VIDEO' },
              ],
            },
            notes: {
              create: [
                { content: 'Resolver arguments: parent, args, context, info. Context is shared per request — perfect for DB client and auth.' },
              ],
            },
          },
          {
            title: 'Apollo Server v4/v5 Setup',
            order: 3,
            status: 'NOT_STARTED',
            resources: {
              create: [
                { title: 'Apollo Server Getting Started', url: 'https://www.apollographql.com/docs/apollo-server/getting-started', type: 'TUTORIAL' },
              ],
            },
          },
        ],
      },
      courseTags: {
        create: [
          { tagId: tagMap['graphql'] },
          { tagId: tagMap['backend'] },
          { tagId: tagMap['node'] },
        ],
      },
    },
  });
  console.log(`Created course: ${graphqlCourse.title}`);

  // ---- Course 2: TypeScript Fundamentals ----
  const tsCourse = await prisma.course.create({
    data: {
      title: 'TypeScript Fundamentals',
      description: 'Master TypeScript type system, generics, utility types, and integration with Node.js.',
      status: 'COMPLETED',
      userId: user.id,
      topics: {
        create: [
          {
            title: 'Type System Basics',
            order: 1,
            status: 'COMPLETED',
            resources: {
              create: [
                { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/', type: 'DOCUMENTATION' },
              ],
            },
            notes: {
              create: [
                { content: 'TypeScript adds static typing to JavaScript. Use interfaces for object shapes and type aliases for unions/intersections.' },
              ],
            },
          },
          {
            title: 'Generics & Utility Types',
            order: 2,
            status: 'COMPLETED',
            resources: {
              create: [
                { title: 'TypeScript Generics Tutorial', url: 'https://www.youtube.com/watch?v=example2', type: 'VIDEO' },
              ],
            },
          },
        ],
      },
      courseTags: {
        create: [
          { tagId: tagMap['typescript'] },
          { tagId: tagMap['frontend'] },
          { tagId: tagMap['backend'] },
        ],
      },
    },
  });
  console.log(`Created course: ${tsCourse.title}`);

  // ---- Course 3: PostgreSQL & Prisma ----
  const dbCourse = await prisma.course.create({
    data: {
      title: 'PostgreSQL & Prisma',
      description: 'Learn relational database design, SQL, and Prisma ORM for Node.js applications.',
      status: 'NOT_STARTED',
      userId: user.id,
      topics: {
        create: [
          {
            title: 'Database Design & Normalization',
            order: 1,
            status: 'NOT_STARTED',
            resources: {
              create: [
                { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'TUTORIAL' },
              ],
            },
          },
          {
            title: 'Prisma ORM Basics',
            order: 2,
            status: 'NOT_STARTED',
            resources: {
              create: [
                { title: 'Prisma Getting Started', url: 'https://www.prisma.io/docs/getting-started', type: 'DOCUMENTATION' },
                { title: 'Prisma Crash Course', url: 'https://www.youtube.com/watch?v=example3', type: 'VIDEO' },
              ],
            },
          },
          {
            title: 'Migrations & Schema Evolution',
            order: 3,
            status: 'NOT_STARTED',
          },
        ],
      },
      courseTags: {
        create: [
          { tagId: tagMap['database'] },
          { tagId: tagMap['backend'] },
        ],
      },
    },
  });
  console.log(`Created course: ${dbCourse.title}`);

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
