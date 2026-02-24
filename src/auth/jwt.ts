import jwt from 'jsonwebtoken';

/**
 * JWT Helper Functions
 *
 * JWT (JSON Web Token) is a way to prove identity without sessions.
 *
 * Flow:
 * 1. User logs in → server creates a token containing { userId: "abc" }
 * 2. Server signs it with JWT_SECRET → produces a long string like "eyJhbG..."
 * 3. Client stores this token and sends it with every request:
 *    Authorization: Bearer eyJhbG...
 * 4. Server verifies the signature → extracts userId → knows who's making the request
 *
 * IMPORTANT: JWT is signed, NOT encrypted.
 * Anyone can decode and read the payload. Never put passwords or secrets in it.
 * The signature only guarantees the payload wasn't tampered with.
 */

const JWT_SECRET = process.env.JWT_SECRET!;

// Token payload — what we store inside the JWT
interface TokenPayload {
  userId: string;
}

/**
 * Generate a JWT for a user
 * Called after successful signup or login
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',  // Token expires in 7 days — user must log in again after that
  });
}

/**
 * Verify and decode a JWT
 * Called on every request to identify the user
 * Returns the payload if valid, null if expired/tampered/invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    // Token is invalid, expired, or tampered with
    return null;
  }
}
