import { z } from 'zod';

/**
 * Schema representing a standardized contract error.
 *
 * @usage
 * - Used in API responses with status codes like 400 or 404.
 * - Provides consistent error shape across client/server boundaries.
 */
export const contractErrorSchema = z.object({
  /**
   * A human-readable string describing the error.
   */
  message: z.string({ message: '"message" must be a string' }),
});

/**
 * TypeScript type inferred from `contractErrorSchema`.
 *
 * Represents the shape of an error returned by API routes using ts-rest.
 */
export type ContractError = z.infer<typeof contractErrorSchema>;
