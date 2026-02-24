import { GraphQLError } from 'graphql';
import { Context } from '../index';

/**
 * Shared auth utility — used by all resolvers that require authentication.
 * Throws a GraphQL error if the user is not authenticated.
 * Returns the user object if they are (so you can use it directly).
 */
export function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
}
