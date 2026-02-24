import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { Context } from '../../index';
import { generateToken } from '../../auth/jwt';

/**
 * Auth Resolvers — signup and login
 *
 * Signup flow:
 * 1. Check if email already exists → throw error if so
 * 2. Hash the password with bcrypt (never store plain text passwords!)
 * 3. Create the user in the database
 * 4. Generate a JWT token
 * 5. Return { token, user }
 *
 * Login flow:
 * 1. Find user by email → throw error if not found
 * 2. Compare provided password with stored hash using bcrypt
 * 3. If match → generate JWT and return { token, user }
 * 4. If no match → throw error
 *
 * About bcrypt:
 * bcrypt.hash("password", 10) doesn't just hash — it also adds a random "salt".
 * This means even if two users have the same password, their hashes are different.
 * The "10" is the cost factor — higher = slower = more secure (10 is standard).
 */

const authResolvers = {
  Mutation: {
    signup: async (_parent: unknown, args: { input: any }, context: Context) => {
      const { email, password, name } = args.input;

      // Check if email is already taken
      const existingUser = await context.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new GraphQLError('Email is already in use', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Hash the password — NEVER store plain text passwords
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const user = await context.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      // Generate JWT
      const token = generateToken(user.id);

      return { token, user };
    },

    login: async (_parent: unknown, args: { input: any }, context: Context) => {
      const { email, password } = args.input;

      // Find user by email
      const user = await context.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Vague error on purpose — don't reveal whether the email exists
        // This prevents attackers from enumerating valid email addresses
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Compare provided password with stored hash
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Generate JWT
      const token = generateToken(user.id);

      return { token, user };
    },
  },
};

export default authResolvers;
