import { z } from 'zod';

/**
 * Schema representing an available booking slot.
 *
 * @property slot - A valid JavaScript Date object representing the start time of the slot.
 *
 * @remarks
 * - Must be aligned to predefined booking boundaries (e.g., every 30 minutes).
 * - Should be in UTC to ensure consistency across time zones.
 */
export const availableSlotSchema = z.object({ slot: z.date({ message: '"slot" must be a valid date' }) }).strict();

/**
 * TypeScript type inferred from {@link availableSlot}.
 */
export type AvailableSlot = z.infer<typeof availableSlotSchema>;
