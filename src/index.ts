import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import typeDefs from './schema/typeDefs';
import resolvers from './schema/resolvers/index';
import { createDataLoaders, DataLoaders } from './dataloaders/index';

/**
 * Apollo Context
 *
 * The context object is created fresh for EVERY incoming GraphQL request.
 * It's the standard way to share per-request data across all resolvers:
 * - Database client (Prisma) — shared across all requests (Prisma handles pooling)
 * - DataLoaders — NEW instance per request (prevents stale cache across requests)
 * - Authenticated user (Phase 4)
 *
 * Every resolver receives this as the 3rd argument: (parent, args, context)
 */
export interface Context {
  prisma: PrismaClient;
  loaders: DataLoaders;
}

// Single Prisma instance — reused across all requests
// (connection pooling is handled internally by Prisma)
//
// The `log` option tells Prisma to print every SQL query to the console.
// This is how we'll SEE the N+1 problem — watch the terminal when you
// run a nested query like { courses { topics { title } } }
// You'll see one SELECT for courses, then a separate SELECT for topics
// for EACH course. That's N+1.
const prisma = new PrismaClient({
  log: ['query'],
});

async function startServer() {
  const app = express();

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      // This function runs on EVERY request to build the context
      // prisma is reused (singleton), loaders are fresh (per-request)
      context: async () => ({
        prisma,
        loaders: createDataLoaders(prisma),
      }),
    }),
  );

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
