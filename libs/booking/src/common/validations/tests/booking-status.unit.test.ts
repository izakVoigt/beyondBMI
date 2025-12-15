import { faker } from '@faker-js/faker';

import { BookingStatus } from '../../enums/status';
import { bookingStatusReturn, bookingStatusSchema } from '../booking-status';

describe('bookingStatus', () => {
  describe('bookingStatusSchema', () => {
    it('should pass for each valid booking status', () => {
      const statuses = Object.values(BookingStatus);

      for (const status of statuses) {
        const result = bookingStatusSchema.safeParse(status);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(status);
        }
      }
    });

    it('should fail for an invalid status string', () => {
      const result = bookingStatusSchema.safeParse(faker.lorem.word());

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.length === 0);

        expect(issue).toBeTruthy();
        expect(issue?.message).toMatch(/must be one of/);
      }
    });

    it('should fail for an empty string', () => {
      const result = bookingStatusSchema.safeParse('');

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.length === 0);

        expect(issue).toBeTruthy();
        expect(issue?.message).toMatch(/must be one of/);
      }
    });

    it('should fail for a non-string type (number)', () => {
      const result = bookingStatusSchema.safeParse(123);

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.length === 0);

        expect(issue).toBeTruthy();
        expect(issue?.message).toMatch(/must be one of/);
      }
    });

    it('should fail for a non-string type (object)', () => {
      const result = bookingStatusSchema.safeParse({ status: BookingStatus.PENDING });

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.length === 0);

        expect(issue).toBeTruthy();
      }
    });
  });

  describe('bookingStatusReturn', () => {
    it('should pass with a valid bookingStatus', () => {
      const payload = { bookingStatus: BookingStatus.PENDING };
      const result = bookingStatusReturn.safeParse(payload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bookingStatus).toBe(BookingStatus.PENDING);
      }
    });

    it('should fail if bookingStatus is missing', () => {
      const result = bookingStatusReturn.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.join('.') === 'bookingStatus');

        expect(issue).toBeTruthy();
      }
    });

    it('should fail if bookingStatus is invalid', () => {
      const result = bookingStatusReturn.safeParse({
        bookingStatus: faker.lorem.word(),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.join('.') === 'bookingStatus');

        expect(issue).toBeTruthy();
        expect(issue?.message).toMatch(/must be one of/);
      }
    });

    it('should fail if bookingStatus has the wrong type (number)', () => {
      const result = bookingStatusReturn.safeParse({
        bookingStatus: faker.number.int(),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.join('.') === 'bookingStatus');

        expect(issue).toBeTruthy();
      }
    });

    it('should fail if extra fields are present (strict schema)', () => {
      const result = bookingStatusReturn.safeParse({
        bookingStatus: BookingStatus.CONFIRMED,
        extra: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => /unrecognized key|unrecognized keys/i.test(i.message))).toBe(true);
      }
    });
  });
});
