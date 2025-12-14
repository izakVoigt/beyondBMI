import { BOOKING_TIME_MS } from '../constants/booking-time';

/**
 * Checks whether a given date is aligned to the booking slot duration.
 *
 * @remarks
 * The validation is done in UTC and ensures:
 * - The timestamp is a valid Date
 * - The time aligns exactly with the slot boundary (e.g. 10:00, 10:30, 11:00)
 *
 * @param date - Date to validate
 * @returns `true` if the date is aligned to the booking slot
 */
export const isAlignedToSlot = (date: Date): boolean => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() % BOOKING_TIME_MS === 0;
};
