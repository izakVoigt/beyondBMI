import { faker } from '@faker-js/faker';
import { BOOKING_TIME_MS } from '@libs/booking/common/constants/booking-time';
import { BookingStatus } from '@libs/booking/common/enums/status';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { BookingModel } from '../booking';

const alignedDateTime = (): Date => {
  const base = Date.UTC(2025, 0, 1, 10, 0, 0, 0);

  return new Date(base - (base % BOOKING_TIME_MS));
};

describe('BookingModel', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    await BookingModel.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  afterEach(async () => {
    await BookingModel.deleteMany({});
  });

  it('should not allow two bookings with the same dateTime', async () => {
    const dateTime = alignedDateTime();

    await BookingModel.create({
      dateTime,
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      status: BookingStatus.CONFIRMED,
    });

    await expect(
      BookingModel.create({
        dateTime,
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        status: BookingStatus.PENDING,
      }),
    ).rejects.toMatchObject({ code: 11000 });
  });
});
