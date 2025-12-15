import { emailRegex } from '@libs/common/regex/email';
import { z } from 'zod';

import { bookingStatusSchema } from './booking-status';
import { isAlignedToSlot } from '../utils/is-aligned-to-slot';

/**
 * Zod schema used to validate booking mutation payloads at the API boundary.
 *
 * @remarks
 * This schema represents the **client-facing booking payload** used when
 * creating or updating a booking.
 *
 * Responsibilities:
 * - Validate data types and formats (email, name, date)
 * - Enforce booking slot alignment rules
 * - Provide fast, user-friendly validation errors
 *
 * Notes:
 * - Database-level constraints (indexes, uniqueness, etc.) are enforced separately
 *   in the persistence layer (Mongoose).
 * - Slot alignment is validated both here and at persistence level to avoid
 *   inconsistent or invalid bookings.
 * - All dates are expected to be provided in **UTC**.
 */
export const bookingMutateSchema = z
  .object({
    /**
     * Booking slot start date and time.
     *
     * @remarks
     * - Must be a valid JavaScript {@link Date} instance.
     * - Must be aligned to the configured booking slot boundaries
     * - Expected to be normalized to UTC.
     */
    dateTime: z.date({ message: '"dateTime" must be a valid date' }).refine(value => isAlignedToSlot(value), {
      message: '"dateTime" must be aligned to the booking slot boundaries (UTC)',
    }),

    /**
     * Customer email address.
     *
     * @remarks
     * - Must be a valid email format.
     * - Length is capped to prevent invalid or abusive input.
     * - Normalization (e.g. lowercasing) is handled at persistence level.
     */
    email: z
      .string({ message: '"email" must be a string' })
      .max(254, '"email" must be at most 254 characters long')
      .regex(emailRegex, '"email" must be a valid email'),

    /**
     * Customer full name.
     *
     * @remarks
     * - Used for display, auditing and customer identification.
     */
    name: z
      .string({ message: '"name" must be a string' })
      .max(120, '"name" must be at most 120 characters long')
      .min(2, '"name" must be at least 2 characters long'),

    /**
     * Booking status.
     */
    status: bookingStatusSchema,
  })
  .strict();

/**
 * TypeScript representation of a validated booking mutation payload.
 *
 * @remarks
 * This type represents the booking data after API-level validation
 * and before persistence-specific fields are added.
 *
 * @see {@link bookingMutateSchema}
 */
export type BookingMutate = z.infer<typeof bookingMutateSchema>;
