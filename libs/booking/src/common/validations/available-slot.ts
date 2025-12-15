import { z } from 'zod';

/**
 * Schema representing a single available booking slot.
 *
 * @remarks
 * A slot represents the **start time** of a bookable interval.
 * and is not encoded in this schema.
 *
 * All slots:
 * - Must be aligned to predefined booking boundaries.
 * - Must fall within configured business hours.
 * - Must be represented in **UTC** to avoid time zone inconsistencies.
 */
export const availableSlotSchema = z
  .object({
    /**
     * Start date and time of the booking slot.
     *
     * @remarks
     * - Represents the exact start of the slot interval.
     * - Must be a valid JavaScript {@link Date} instance.
     * - Expected to be normalized to UTC.
     */
    slot: z.date({ message: '"slot" must be a valid date' }),
  })
  .strict();

/**
 * TypeScript representation of a single available booking slot.
 *
 * @see {@link availableSlotSchema}
 */
export type AvailableSlot = z.infer<typeof availableSlotSchema>;

/**
 * Schema representing a collection of available booking slots.
 *
 * @remarks
 * - Typically returned by availability lookup endpoints.
 * - The array is expected to be sorted in ascending chronological order.
 */
export const availableSlotArraySchema = z.array(availableSlotSchema);

/**
 * TypeScript representation of an array of available booking slots.
 *
 * @see {@link availableSlotArraySchema}
 */
export type AvailableSlotArray = z.infer<typeof availableSlotArraySchema>;
