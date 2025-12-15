import { faker } from '@faker-js/faker';

import { BOOKING_TIME_MS } from '../../constants/booking-time';
import { BookingStatus } from '../../enums/status';
import { bookingMutateSchema } from '../booking-mutate';

const alignedDate = (): Date => {
  const base = Date.UTC(2025, 0, 1, 10, 0, 0, 0);
  const aligned = base - (base % BOOKING_TIME_MS);
  return new Date(aligned);
};

const nonAlignedDate = (): Date => new Date(alignedDate().getTime() + 1);

describe('bookingMutateSchema', () => {
  it('should pass with a valid booking payload (status omitted)', () => {
    const payload = {
      dateTime: alignedDate(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
    };

    const result = bookingMutateSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });

  it('should pass with a valid booking payload (status provided)', () => {
    const payload = {
      dateTime: alignedDate(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      status: BookingStatus.CONFIRMED,
    };

    const result = bookingMutateSchema.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(BookingStatus.CONFIRMED);
    }
  });

  it('should fail when email is invalid', () => {
    const payload = {
      dateTime: alignedDate(),
      email: `${faker.internet.username()}example.com`,
      name: faker.person.fullName(),
      status: BookingStatus.PENDING,
    };

    const result = bookingMutateSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.join('.') === 'email')).toBe(true);
    }
  });

  it('should fail when name is too short', () => {
    const payload = {
      dateTime: alignedDate(),
      email: faker.internet.email().toLowerCase(),
      name: 'A',
      status: BookingStatus.PENDING,
    };

    const result = bookingMutateSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.join('.') === 'name')).toBe(true);
    }
  });

  it('should fail when dateTime is not aligned to booking slot boundaries', () => {
    const payload = {
      dateTime: nonAlignedDate(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      status: BookingStatus.PENDING,
    };

    const result = bookingMutateSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.filter(i => i.path.join('.') === 'dateTime');

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.message.includes('aligned'))).toBe(true);
    }
  });

  it('should fail when status is invalid', () => {
    const payload = {
      dateTime: alignedDate(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      status: 'invalid-status' as unknown as BookingStatus,
    };

    const result = bookingMutateSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.join('.') === 'status')).toBe(true);
    }
  });

  it('should fail when extra fields are present (strict schema)', () => {
    const payload = {
      dateTime: alignedDate(),
      email: faker.internet.email().toLowerCase(),
      extra: true,
      name: faker.person.fullName(),
    };

    const result = bookingMutateSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => /unrecognized key|unrecognized keys/i.test(i.message))).toBe(true);
    }
  });
});
