import type { BookingMongoDb } from '../booking-mongodb';

import { faker } from '@faker-js/faker';

import { BOOKING_TIME_MS } from '../../constants/booking-time';
import { BookingStatus } from '../../enums/status';
import { bookingMongoDbArraySchema, bookingMongoDbSchema } from '../booking-mongodb';

const alignedDate = (): Date => {
  const base = Date.UTC(2025, 0, 1, 10, 0, 0, 0);
  const aligned = base - (base % BOOKING_TIME_MS);

  return new Date(aligned);
};

describe('bookingMongoDb', () => {
  const makeValidBooking = (overrides: Partial<Record<string, unknown>> = {}): BookingMongoDb => ({
    _id: faker.database.mongodbObjectId(),
    createdAt: faker.date.anytime(),
    dateTime: alignedDate(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    status: BookingStatus.PENDING,
    updatedAt: faker.date.anytime(),
    ...overrides,
  });

  describe('bookingMongoDbSchema', () => {
    it('should pass with a valid MongoDB booking document (domain + baseDocument fields)', () => {
      const booking = makeValidBooking();

      const result = bookingMongoDbSchema.safeParse(booking);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data._id).toBe(booking._id);
        expect(result.data.dateTime).toBeInstanceOf(Date);
        expect(result.data.status).toBe(BookingStatus.PENDING);
      }
    });

    it('should pass when paymentIntentId is present', () => {
      const booking = makeValidBooking({
        paymentIntentId: faker.string.uuid(),
      });

      const result = bookingMongoDbSchema.safeParse(booking);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentIntentId).toBe(booking.paymentIntentId);
      }
    });

    it('should fail when required booking fields are missing (even if baseDocument fields exist)', () => {
      const booking = {
        _id: faker.database.mongodbObjectId(),
        createdAt: faker.date.anytime(),
        dateTime: alignedDate(),
        status: BookingStatus.PENDING,
        updatedAt: faker.date.anytime(),
      };

      const result = bookingMongoDbSchema.safeParse(booking);

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailIssue = result.error.issues.find(i => i.path.join('.') === 'email');
        const nameIssue = result.error.issues.find(i => i.path.join('.') === 'name');

        expect(emailIssue || nameIssue).toBeTruthy();
      }
    });

    it('should fail if paymentIntentId is an empty string', () => {
      const booking = makeValidBooking({ paymentIntentId: '' });

      const result = bookingMongoDbSchema.safeParse(booking);

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.join('.') === 'paymentIntentId');

        expect(issue).toBeTruthy();
        expect(issue?.message).toBe('"paymentIntentId" must be a valid ID');
      }
    });

    it('should fail if extra fields are present (strict schema)', () => {
      const booking = makeValidBooking({ extra: true });

      const result = bookingMongoDbSchema.safeParse(booking);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => /unrecognized key|unrecognized keys/i.test(i.message))).toBe(true);
      }
    });
  });

  describe('bookingMongoDbArraySchema', () => {
    it('should pass with an empty array', () => {
      const result = bookingMongoDbArraySchema.safeParse([]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should pass with an array of valid bookings', () => {
      const bookings = Array.from({ length: 3 }, () => makeValidBooking());

      const result = bookingMongoDbArraySchema.safeParse(bookings);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
        result.data.forEach((b, index) => {
          expect(b._id).toBe(bookings[index]._id);
          expect(b.dateTime).toBeInstanceOf(Date);
        });
      }
    });

    it('should fail if one element in the array is invalid', () => {
      const bookings = [makeValidBooking(), { ...makeValidBooking(), email: undefined }];

      const result = bookingMongoDbArraySchema.safeParse(bookings);

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.join('.') === '1.email');

        expect(issue).toBeTruthy();
      }
    });

    it('should fail if array contains non-object values', () => {
      const result = bookingMongoDbArraySchema.safeParse([makeValidBooking(), faker.number.int()]);

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path[0] === 1);

        expect(issue).toBeTruthy();
      }
    });

    it('should fail if value is not an array', () => {
      const result = bookingMongoDbArraySchema.safeParse(makeValidBooking());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/array/i);
      }
    });
  });
});
