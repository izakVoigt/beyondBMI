import type { AvailableSlotArray } from '@libs/booking/common/validations/available-slot';

import { addDays, addMilliseconds, startOfDay, max as maxDate, min as minDate } from 'date-fns';

/**
 * Generates a unique numeric key for a slot based on its timestamp.
 *
 * @param date - Slot start date
 * @returns Milliseconds since Unix epoch
 */
export const slotKey = (d: Date): number => d.getTime();

/**
 * Rounds a date up to the nearest slot boundary.
 *
 * @param date - Input date
 * @param slotMs - Slot duration in milliseconds
 * @returns Date aligned to the next slot boundary
 */
const roundUpToSlot = (date: Date, slotMs: number): Date => new Date(Math.ceil(date.getTime() / slotMs) * slotMs);

/**
 * Generates all available booking slots within business hours
 * for a given date range.
 *
 * @remarks
 * - Slots are generated in fixed intervals defined by `slotMs`
 * - Only slots fully contained within business hours are returned
 * - Business hours are defined as millisecond offsets from start of day
 * - All dates are expected to be in UTC
 *
 * @param startDate - Start of the search range (inclusive)
 * @param endDate - End of the search range (inclusive)
 * @param slotMs - Slot duration in milliseconds (e.g. 30 minutes)
 * @param businessStartMs - Business start offset from start of day (ms)
 * @param businessEndMs - Business end offset from start of day (ms)
 *
 * @returns Array of available booking slots
 */
export const generateBusinessSlots = (
  startDate: Date,
  endDate: Date,
  slotMs: number,
  businessStartMs: number,
  businessEndMs: number,
): AvailableSlotArray => {
  const slots: AvailableSlotArray = [];

  for (let day = startOfDay(startDate); day <= endDate; day = addDays(day, 1)) {
    const businessStart = new Date(day.getTime() + businessStartMs);
    const businessEnd = new Date(day.getTime() + businessEndMs);

    const windowStart = maxDate([businessStart, startDate]);
    const windowEnd = minDate([businessEnd, endDate]);

    for (
      let t = roundUpToSlot(windowStart, slotMs);
      t.getTime() + slotMs <= windowEnd.getTime();
      t = addMilliseconds(t, slotMs)
    ) {
      slots.push({ slot: t });
    }
  }

  return slots;
};
