import { faker } from '@faker-js/faker';

import { BOOKING_TIME_MS } from '../../constants/booking-time';
import { BookingStatus } from '../../enums/status';
import { bookingMongoDbSchema, bookingSchema } from '../booking';

const alignedDate = (): Date => {
  const base = Date.UTC(2025, 0, 1, 10, 0, 0, 0);
  const aligned = base - (base % BOOKING_TIME_MS);
  return new Date(aligned);
};

const nonAlignedDate = (): Date => new Date(alignedDate().getTime() + 1);

describe('bookingSchema', () => {
  it('should validate a valid booking payload (status omitted)', () => {
    const payload = {
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      startDate: alignedDate(),
    };

    const result = bookingSchema.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBeUndefined();
    }
  });

  it('should validate a valid booking payload (status provided)', () => {
    const payload = {
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      startDate: alignedDate(),
      status: BookingStatus.CONFIRMED,
    };

    const result = bookingSchema.safeParse(payload);

    expect(result.success).toBe(true);
  });

  it('should fail when email is invalid', () => {
    const payload = {
      email: `${faker.internet.username()}example.com`,
      name: faker.person.fullName(),
      startDate: alignedDate(),
      status: BookingStatus.PENDING,
    };

    const result = bookingSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.join('.') === 'email')).toBe(true);
    }
  });

  it('should fail when name is too short', () => {
    const payload = {
      email: faker.internet.email().toLowerCase(),
      name: 'A',
      startDate: alignedDate(),
      status: BookingStatus.PENDING,
    };

    const result = bookingSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.join('.') === 'name')).toBe(true);
    }
  });

  it('should fail when startDate is not aligned to the booking slot boundaries', () => {
    const payload = {
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      startDate: nonAlignedDate(),
      status: BookingStatus.PENDING,
    };

    const result = bookingSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (!result.success) {
      const startDateIssues = result.error.issues.filter(i => i.path.join('.') === 'startDate');

      expect(startDateIssues.length).toBeGreaterThan(0);
      expect(startDateIssues.some(i => i.message.includes('aligned'))).toBe(true);
    }
  });

  it('should fail when status is invalid', () => {
    const payload = {
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      startDate: alignedDate(),
      status: 'invalid-status' as unknown as BookingStatus,
    };

    const result = bookingSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.join('.') === 'status')).toBe(true);
    }
  });
});

describe('bookingMongoDbSchema', () => {
  it('should validate a valid MongoDB booking document (booking + baseDocument fields)', () => {
    const booking = {
      _id: faker.database.mongodbObjectId(),
      createdAt: faker.date.anytime(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      startDate: alignedDate(),
      status: BookingStatus.PENDING,
      updatedAt: faker.date.anytime(),
    };

    const result = bookingMongoDbSchema.safeParse(booking);

    expect(result.success).toBe(true);
  });

  it('should fail when booking fields are missing (even if baseDocument fields exist)', () => {
    const booking = {
      _id: faker.database.mongodbObjectId(),
      createdAt: faker.date.anytime(),
      startDate: alignedDate(),
      status: BookingStatus.PENDING,
      updatedAt: faker.date.anytime(),
    };

    const result = bookingMongoDbSchema.safeParse(booking);
    expect(result.success).toBe(false);
  });
});
