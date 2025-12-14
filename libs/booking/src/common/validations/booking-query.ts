import { objectIdRegex } from '@libs/common/regex/object-id';
import { z } from 'zod';

/**
 * Schema for validating booking ID passed as a route or query parameter.
 *
 * @remarks
 * - Rejects empty or invalid ObjectId formats.
 * - Enforces strict object (no extra properties allowed).
 */
export const bookingQueryParamsSchema = z
  .object({
    /**
     * Unique booking identifier (MongoDB ObjectId).
     */
    bookingId: z
      .string({ message: '"bookingId" must be a string' })
      .regex(objectIdRegex, '"bookingId" must be a valid ObjectId'),
  })
  .strict();

/**
 * TypeScript type inferred from {@link bookingQueryParams}.
 */
export type BookingQueryParams = z.infer<typeof bookingQueryParamsSchema>;

/**
 * Schema for validating a range of booking slots based on start and end dates.
 *
 * @constraints
 * - `startDate` must be before or equal to `endDate`.
 * - The date range must not exceed 31 days.
 *
 * @remarks
 * - Accepts ISO date strings or native Date objects.
 * - Automatically coerces input to valid `Date` instances.
 * - Enforces strict object structure (disallows unknown keys).
 */
export const bookingQuerySearchSchema = z
  .object({
    /**
     * End of the date range (inclusive).
     * Accepts string (ISO) or Date; coerced to Date.
     */
    endDate: z.coerce.date({ message: '"endDate" must be a valid date' }),

    /**
     * Start of the date range (inclusive).
     * Accepts string (ISO) or Date; coerced to Date.
     */
    startDate: z.coerce.date({ message: '"startDate" must be a valid date' }),
  })
  .strict()
  .refine(({ endDate, startDate }) => startDate <= endDate, {
    message: '"startDate" must be before or equal to "endDate"',
    path: ['startDate'],
  })
  .refine(
    ({ endDate, startDate }) => {
      const MAX_DIFF = 31 * 24 * 60 * 60 * 1000; // 31 days

      return endDate.getTime() - startDate.getTime() <= MAX_DIFF;
    },
    { message: 'Date range cannot exceed 31 days', path: ['endDate'] },
  );

/**
 * TypeScript type inferred from {@link bookingQuerySearch}.
 */
export type BookingQuerySearch = z.infer<typeof bookingQuerySearchSchema>;
