import { PrismaClient } from '@prisma/client';
import { verifyToken } from './jwt';

/**
 * Extract authenticated user from the request
 *
 * This runs on EVERY request as part of building the Apollo context.
 * It looks for a JWT in the Authorization header:
 *   Authorization: Bearer eyJhbG...
 *
 * If found and valid → returns the user object from the database
 * If missing or invalid → returns null (request is unauthenticated)
 *
 * We don't throw an error for missing tokens because some operations
 * (like login and signup) don't require authentication.
 * Individual resolvers decide whether to require auth or not.
 */
export async function getAuthenticatedUser(
  authHeader: string | undefined,
  prisma: PrismaClient
) {
  // No Authorization header → unauthenticated request (that's OK)
  if (!authHeader) return null;

  // Extract token from "Bearer <token>"
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;

  // Verify the token and extract the payload
  const payload = verifyToken(token);
  if (!payload) return null;

  // Look up the actual user in the database
  // (The token only contains userId — we need the full user object)
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return user;
}
