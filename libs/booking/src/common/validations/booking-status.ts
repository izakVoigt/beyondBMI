import { z } from 'zod';

import { BookingStatus } from '../enums/status';

/**
 * Zod schema representing the status of a booking.
 *
 * @remarks
 * This schema restricts the booking status to one of the predefined
 * {@link BookingStatus} enum values.
 *
 * It is commonly used:
 * - At the API boundary (request/response validation)
 * - In route parameters and payloads
 * - As part of larger booking-related schemas
 *
 * A custom error message is returned when validation fails,
 * explicitly listing the allowed values.
 */
export const bookingStatusSchema = z.enum(Object.values(BookingStatus) as [string, ...string[]], {
  message: `"status" must be one of: ${Object.values(BookingStatus).join(', ')}`,
});

/**
 * Schema representing a booking status response payload.
 *
 * @remarks
 * Typically used by endpoints that update or return the current
 * status of a booking (e.g. cancel, confirm payment).
 */
export const bookingStatusReturn = z
  .object({
    /**
     * Current status of the booking.
     */
    bookingStatus: bookingStatusSchema,
  })
  .strict();
