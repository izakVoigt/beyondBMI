import { faker } from '@faker-js/faker';

import { BOOKING_TIME_MS } from '../../constants/booking-time';
import { isAlignedToSlot } from '../is-aligned-to-slot';

describe('isAlignedToSlot', () => {
  it('should return true for dates aligned exactly to the booking slot', () => {
    const baseTimestamp = Date.UTC(2025, 0, 1, 0, 0, 0, 0);

    const dates = Array.from({ length: 10 }, (_, index) => {
      return new Date(baseTimestamp + index * BOOKING_TIME_MS);
    });

    for (const date of dates) {
      expect(isAlignedToSlot(date)).toBe(true);
    }
  });

  it('should return true for random aligned dates generated from a valid base', () => {
    const baseTimestamp = Date.UTC(2025, 5, 15, 12, 0, 0, 0);

    const dates = Array.from({ length: 10 }, () => {
      const multiplier = faker.number.int({ max: 48, min: 0 });

      return new Date(baseTimestamp + multiplier * BOOKING_TIME_MS);
    });

    for (const date of dates) {
      expect(isAlignedToSlot(date)).toBe(true);
    }
  });

  it('should return false for dates not aligned to the booking slot', () => {
    const baseTimestamp = Date.UTC(2025, 0, 1, 0, 0, 0, 0);

    const dates = Array.from({ length: 10 }, () => {
      const offset = faker.number.int({ max: BOOKING_TIME_MS - 1, min: 1 });

      return new Date(baseTimestamp + offset);
    });

    for (const date of dates) {
      expect(isAlignedToSlot(date)).toBe(false);
    }
  });

  it('should return false for dates with seconds or milliseconds set', () => {
    const date = new Date(Date.UTC(2025, 0, 1, 10, 0, 30, 500));

    expect(isAlignedToSlot(date)).toBe(false);
  });

  it('should return false for invalid Date instances', () => {
    const invalidDate = new Date('invalid-date');

    expect(isAlignedToSlot(invalidDate)).toBe(false);
  });

  it('should return false for non-Date values', () => {
    const values = [null, undefined, '2025-01-01T10:00:00Z', 1735725600000, {}] as unknown[];

    for (const value of values) {
      expect(isAlignedToSlot(value as Date)).toBe(false);
    }
  });
});
