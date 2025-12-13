import { z } from 'zod';

/**
 * Zod schema that converts a numeric string into a native number.
 *
 * @remarks
 * The value is converted using `Number(...)` and then validated to ensure
 * it is a finite number (i.e. not `NaN`, `Infinity`, or `-Infinity`).
 */
export const numberFromString = z
  .string()
  .transform(value => Number(value))
  .refine(value => Number.isFinite(value), 'Must be a valid number');
