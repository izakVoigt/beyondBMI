import { z } from 'zod';

/**
 * Zod schema that converts a string-based boolean value into a native boolean.
 *
 * @remarks
 * Accepted values (case-insensitive):
 * - `'true'`  → `true`
 * - `'false'` → `false`
 *
 * Any other value will fail validation.
 */
export const boolFromString = z
  .string()
  .transform(value => value.toLowerCase())
  .pipe(z.enum(['true', 'false']))
  .transform(value => value === 'true');
