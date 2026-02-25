import { GraphQLError } from 'graphql';
import { Context } from '../index';

/**
 * Auth Utilities — shared across all resolvers
 */

/**
 * Require authentication — throws if user is not logged in.
 * Returns the user so you can use it directly:
 *   const user = requireAuth(context);
 */
export function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
}

/**
 * Require ownership — verifies the authenticated user owns the resource.
 *
 * Used to prevent users from modifying other users' data.
 * Example: before deleting a course, check that course.userId === context.user.id
 *
 * @param ownerId - the userId that owns the resource (e.g. course.userId)
 * @param context - the Apollo context (contains the authenticated user)
 *
 * Why a separate function?
 * This check needs to happen in many resolvers (course, topic, resource, note).
 * Centralizing it means:
 * 1. One place to update if the error message or logic changes
 * 2. Consistent error codes across the API
 * 3. Less chance of forgetting to add the check somewhere
 */
export function requireOwnership(ownerId: string, context: Context) {
  const user = requireAuth(context);

  if (ownerId !== user.id) {
    throw new GraphQLError('You do not have permission to modify this resource', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  return user;
}
