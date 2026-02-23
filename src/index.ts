import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import typeDefs from './schema/typeDefs';
import resolvers from './schema/resolvers/index';

/**
 * Apollo Context
 *
 * The context object is created fresh for EVERY incoming GraphQL request.
 * It's the standard way to share per-request data across all resolvers:
 * - Database client (Prisma)
 * - Authenticated user (Phase 4)
 * - DataLoaders (Phase 3)
 *
 * Every resolver receives this as the 3rd argument: (parent, args, context)
 */
export interface Context {
  prisma: PrismaClient;
}

// Single Prisma instance — reused across all requests
// (connection pooling is handled internally by Prisma)
const prisma = new PrismaClient();

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
      context: async () => ({
        prisma,
      }),
    }),
  );

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
