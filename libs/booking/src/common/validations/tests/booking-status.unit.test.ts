import { faker } from '@faker-js/faker';

import { BookingStatus } from '../../enums/status';
import { bookingStatusSchema } from '../booking-status';

describe('bookingStatusSchema', () => {
  it('should pass for each valid status', () => {
    const statuses = Object.values(BookingStatus);

    for (const status of statuses) {
      const result = bookingStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
      expect(result.data).toBe(status);
    }
  });

  it('should fail for an invalid status', () => {
    const result = bookingStatusSchema.safeParse(faker.lorem.word());

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/must be one of/);
    expect(result.error?.issues[0].path).toEqual([]);
  });

  it('should fail for an empty string', () => {
    const result = bookingStatusSchema.safeParse('');

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/must be one of/);
  });

  it('should fail for a non-string type (e.g., number)', () => {
    const result = bookingStatusSchema.safeParse(123);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/must be one of/);
  });
});
