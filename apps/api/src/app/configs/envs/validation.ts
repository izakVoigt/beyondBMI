import { NodeEnv } from '@libs/common/enums/node-env';
import { numberFromString } from '@libs/common/validations/number-from-string';
import { z } from 'zod';

/**
 * Zod schema responsible for validating and parsing all required
 * environment variables for the application.
 *
 * @remarks
 * - Environment variables are provided as strings and validated at
 *   application startup.
 * - This schema ensures early failure (fail-fast) when mandatory
 *   configuration is missing or invalid.
 * - Numeric values such as `PORT` are parsed from strings into their
 *   native types using shared validation helpers.
 *
 * The schema should be evaluated exactly once during bootstrap and
 * its result cached in memory.
 *
 * @throws {ZodError}
 * Thrown when one or more environment variables fail validation.
 */
export const envValidationSchema = z.object({
  /**
   * MongoDB connection string.
   *
   * @example
   * mongodb://localhost:27017/my-database
   */
  MONGODB_URI: z.string().min(1, '"MONGODB_URI" is required'),

  /**
   * Defines the current runtime environment.
   *
   * This value is typically derived from the `NODE_ENV` environment
   * variable and is used to control environment-specific behavior
   * such as logging, feature flags, and error handling.
   */
  NODE_ENV: z.enum(Object.values(NodeEnv) as [string, ...string[]], {
    message: `"NODE_ENV" must be one of the following: ${Object.values(NodeEnv).join(', ')}`,
  }),

  /**
   * Port on which the HTTP server will listen.
   *
   * The value is parsed from a string into a number and must be a
   * valid finite numeric value.
   */
  PORT: numberFromString,
});

/**
 * Strongly-typed representation of all validated environment variables.
 *
 * @remarks
 * This type is inferred directly from {@link envValidationSchema}
 * to guarantee full type-safety and consistency between validation
 * and runtime usage.
 */
export type Env = z.infer<typeof envValidationSchema>;
