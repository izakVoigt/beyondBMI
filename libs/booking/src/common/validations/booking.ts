import { emailRegex } from '@libs/common/regex/email';
import { baseDocumentSchema } from '@libs/mongoose/validations/base-document';
import { z } from 'zod';

import { BookingStatus } from '../enums/status';
import { isAlignedToSlot } from '../utils/is-aligned-to-slot';

/**
 * Zod schema used to validate booking payloads at the API boundary.
 *
 * @remarks
 * - This schema is intended for request/response validation (HTTP layer).
 * - Database-level constraints (indexes, uniqueness, etc.) are enforced separately
 *   in the Mongoose schema, but key rules (such as slot alignment) are also validated
 *   here to provide immediate, user-friendly feedback.
 * - Keep this schema in sync with the domain and persistence models.
 */
export const bookingSchema = z.object({
  /**
   * Customer email address.
   *
   * @remarks
   * - Must be a valid email format.
   * - Stored/normalized at persistence level (e.g. lowercase).
   */
  email: z
    .string('"email" must be a string')
    .max(254, '"email" must be at most 254 characters long')
    .regex(emailRegex, '"email" must be a valid email'),

  /**
   * Customer full name.
   *
   * @remarks
   * Used for display and auditing purposes.
   */
  name: z
    .string('"name" must be a string')
    .max(120, '"name" must be at most 120 characters long')
    .min(2, '"name" must be at least 2 characters long'),

  /**
   * Slot start date/time.
   *
   * @remarks
   * - Expected to be a valid JavaScript `Date`.
   * - Must align to the configured booking slot boundaries (e.g. 30 minutes).
   * - This rule is validated both here (API boundary) and at persistence level.
   */
  startDate: z.date('"startDate" must be a valid date').refine(value => isAlignedToSlot(value), {
    message: '"startDate" must be aligned to the booking slot boundaries (UTC)',
  }),

  /**
   * Booking status.
   *
   * @remarks
   * - Optional at API level.
   * - Defaults to {@link BookingStatus.PENDING} at persistence level if omitted.
   */
  status: z
    .enum(BookingStatus, {
      message: `"status" must be one of: ${Object.values(BookingStatus).join(', ')}`,
    })
    .optional(),
});

/**
 * Booking domain type inferred from {@link bookingSchema}.
 *
 * @remarks
 * Represents the validated shape of a booking at the application layer,
 * before persistence-specific fields are added.
 */
export type Booking = z.infer<typeof bookingSchema>;

/**
 * Zod schema representing a booking document as stored in MongoDB.
 *
 * @remarks
 * Extends {@link bookingSchema} with base MongoDB document fields
 * such as `_id`, `createdAt`, and `updatedAt`.
 */
export const bookingMongoDbSchema = bookingSchema.extend(baseDocumentSchema.shape);

/**
 * Booking MongoDB document type inferred from {@link bookingMongoDbSchema}.
 *
 * @remarks
 * Used when reading from or writing to the database.
 */
export type BookingMongoDb = z.infer<typeof bookingMongoDbSchema>;
