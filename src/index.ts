import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import cors from 'cors';
import { PrismaClient, User } from '@prisma/client';
import typeDefs from './schema/typeDefs';
import resolvers from './schema/resolvers/index';
import { createDataLoaders, DataLoaders } from './dataloaders/index';
import { getAuthenticatedUser } from './auth/middleware';

/**
 * Apollo Context
 *
 * Created fresh for EVERY incoming GraphQL request.
 * - prisma: shared database client
 * - loaders: fresh DataLoaders per request
 * - user: the authenticated user (null if not logged in)
 */
export interface Context {
  prisma: PrismaClient;
  loaders: DataLoaders;
  user: User | null;
}

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
      // The context function now receives the Express request object.
      // We use it to read the Authorization header and identify the user.
      context: async ({ req }) => {
        // Extract user from JWT (returns null if no token or invalid token)
        const user = await getAuthenticatedUser(
          req.headers.authorization,
          prisma
        );

        return {
          prisma,
          loaders: createDataLoaders(prisma),
          user,
        };
      },
    }),
  );

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
