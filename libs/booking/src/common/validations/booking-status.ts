import { z } from 'zod';

import { BookingStatus } from '../enums/status';

/**
 * Zod schema representing the status of a booking.
 *
 * @validation
 * - Must be one of the predefined BookingStatus values.
 * - Custom error message returned if validation fails.
 *
 * @usage
 * - Used in API contracts, route parameters, or request/response bodies.
 */
export const bookingStatusSchema = z.enum(Object.values(BookingStatus) as [string, ...string[]], {
  message: `"status" must be one of: ${Object.values(BookingStatus).join(', ')}`,
});
