import { faker } from '@faker-js/faker';

import { BOOKING_TIME_MS } from '../../constants/booking-time';
import { BookingStatus } from '../../enums/status';
import { bookingMongoDbSchema } from '../booking-mongodb';

const alignedDate = (): Date => {
  const base = Date.UTC(2025, 0, 1, 10, 0, 0, 0);
  const aligned = base - (base % BOOKING_TIME_MS);

  return new Date(aligned);
};

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
