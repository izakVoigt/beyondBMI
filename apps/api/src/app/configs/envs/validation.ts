import { NodeEnv } from '@libs/common/enums/node-env';
import { numberFromString } from '@libs/common/validations/number-from-string';
import { z } from 'zod';

/**
 * Zod schema responsible for validating and parsing all required environment
 * variables for the application.
 *
 * @remarks
 * - Environment variables are provided as strings and validated at application start-up.
 * - This schema enforces a fail-fast approach when mandatory configuration is missing
 *   or invalid.
 * - Numeric values (e.g. `PORT`) are parsed from strings into numbers via shared
 *   validation helpers.
 *
 * The schema should be evaluated exactly once during bootstrap and the validated
 * result cached in memory.
 *
 * @throws {z.ZodError}
 * Thrown when one or more environment variables fail validation.
 */
export const envValidationSchema = z.object({
  /**
   * MongoDB connection string.
   *
   * @example mongodb://localhost:27017/my-database
   */
  MONGODB_URI: z.string({ message: '"MONGODB_URI" must be a string' }).min(1, '"MONGODB_URI" is required'),

  /**
   * Defines the current runtime environment.
   *
   * @remarks
   * Used to control environment-specific behavior such as logging levels,
   * feature flags, and error handling.
   */
  NODE_ENV: z.enum(Object.values(NodeEnv) as [string, ...string[]], {
    message: `"NODE_ENV" must be one of the following: ${Object.values(NodeEnv).join(', ')}`,
  }),

  /**
   * Port on which the HTTP server will listen.
   *
   * @remarks
   * Parsed from a string into a number and must be a valid finite value.
   */
  PORT: numberFromString,

  /**
   * Stripe secret API key used by the backend to talk to Stripe.
   *
   * @remarks
   * - Must never be exposed to client applications.
   * - Expected to be a non-empty string (e.g. `sk_test_...` / `sk_live_...`).
   */
  STRIPE_SECRET_KEY: z
    .string({ message: '"STRIPE_SECRET_KEY" must be a string' })
    .min(1, '"STRIPE_SECRET_KEY" is required'),
});

/**
 * Strongly-typed representation of all validated environment variables.
 *
 * @remarks
 * Inferred directly from {@link envValidationSchema} to keep validation and runtime
 * usage in sync.
 */
export type Env = z.infer<typeof envValidationSchema>;
