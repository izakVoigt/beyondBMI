import 'dotenv/config';
import type { Env } from './validation';

import { z } from 'zod';

import { envValidationSchema } from './validation';

let cachedEnvs: Readonly<Env> | null = null;

/**
 * Resolves, validates, and caches all environment variables required
 * by the application.
 *
 * @remarks
 * - Environment variables are loaded from the process environment
 *   (including `.env` files via `dotenv`).
 * - Validation is performed exactly once using {@link envValidationSchema}.
 * - On successful validation, the result is frozen and cached in memory
 *   to prevent accidental mutation and repeated parsing.
 * - On failure, the application fails fast with a descriptive error
 *   message indicating which variables are invalid or missing.
 *
 * This function should be invoked during application bootstrap and
 * its result reused throughout the runtime.
 *
 * @returns A readonly, fully validated {@link Env} object.
 *
 * @throws {Error}
 * Thrown when one or more environment variables fail validation.
 * The error message contains a list of invalid fields and their
 * corresponding validation messages.
 */
export const getEnv = (): Readonly<Env> => {
  if (cachedEnvs) return cachedEnvs;

  const parsed = envValidationSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = z.treeifyError(parsed.error);
    const message = Object.entries(formatted.properties ?? {}).flatMap(([key, value]) =>
      (value.errors ?? []).map(message => `${key}: ${message}`),
    );

    throw new Error(`Invalid environment variables: ${message.join(', ')}`);
  }

  cachedEnvs = Object.freeze(parsed.data);
  return cachedEnvs;
};

/**
 * Cached, validated environment configuration.
 *
 * @remarks
 * This is a convenience export that eagerly resolves the environment
 * configuration at module load time. It should be used in scenarios
 * where a single, immutable configuration instance is sufficient
 * for the entire application lifecycle.
 */
export const env = getEnv();
