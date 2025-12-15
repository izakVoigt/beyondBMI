/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BookingMongoDb } from '@libs/booking/common/validations/booking-mongodb';
import type { BookingMutate } from '@libs/booking/common/validations/booking-mutate';

import { faker } from '@faker-js/faker';
import { BookingStatus } from '@libs/booking/common/enums/status';

import { BookingService } from '../booking';

describe('BookingService', () => {
  const makeBooking = (overrides: Partial<BookingMongoDb> = {}): BookingMongoDb => ({
    _id: faker.database.mongodbObjectId(),
    createdAt: faker.date.anytime(),
    dateTime: faker.date.anytime(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    status: BookingStatus.PENDING,
    updatedAt: faker.date.anytime(),
    ...overrides,
  });

  const makeMutate = (overrides: Partial<BookingMutate> = {}): BookingMutate => ({
    dateTime: faker.date.anytime(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    status: BookingStatus.PENDING,
    ...overrides,
  });

  it('should create a booking using bookingModel.create', async () => {
    const created = makeBooking();
    const bookingModelMock = {
      create: jest.fn().mockResolvedValue(created),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOne: jest.fn(),
    };

    const service = new BookingService(bookingModelMock as any);

    const payload = makeMutate();
    const result = await service.createBooking(payload as any);

    expect(bookingModelMock.create).toHaveBeenCalledTimes(1);
    expect(bookingModelMock.create).toHaveBeenCalledWith(payload);
    expect(result).toBe(created);
  });

  it('should return a booking when getBookingByFilter finds one', async () => {
    const booking = makeBooking();
    const bookingModelMock = {
      create: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOne: jest.fn().mockResolvedValue(booking),
    };

    const service = new BookingService(bookingModelMock as any);

    const query = { _id: booking._id };
    const result = await service.getBookingByFilter(query as any);

    expect(bookingModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(bookingModelMock.findOne).toHaveBeenCalledWith(query);
    expect(result).toBe(booking);
  });

  it('should return null when getBookingByFilter does not find any booking', async () => {
    const bookingModelMock = {
      create: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOne: jest.fn().mockResolvedValue(null),
    };

    const service = new BookingService(bookingModelMock as any);

    const query = { email: faker.internet.email().toLowerCase() };
    const result = await service.getBookingByFilter(query as any);

    expect(bookingModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(bookingModelMock.findOne).toHaveBeenCalledWith(query);
    expect(result).toBeNull();
  });

  it('should query bookings by range using $gte/$lte on dateTime', async () => {
    const bookings = [makeBooking(), makeBooking()];
    const bookingModelMock = {
      create: jest.fn(),
      find: jest.fn().mockResolvedValue(bookings),
      findByIdAndUpdate: jest.fn(),
      findOne: jest.fn(),
    };

    const service = new BookingService(bookingModelMock as any);

    const startDate = faker.date.past();
    const endDate = faker.date.future();

    const result = await service.getBookingsByRange({ endDate, startDate } as any);

    expect(bookingModelMock.find).toHaveBeenCalledTimes(1);
    expect(bookingModelMock.find).toHaveBeenCalledWith({
      dateTime: { $gte: startDate, $lte: endDate },
    });
    expect(result).toBe(bookings);
  });

  it('should update a booking by id using findByIdAndUpdate with { new: true }', async () => {
    const updated = makeBooking({ status: BookingStatus.CONFIRMED });
    const bookingModelMock = {
      create: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn().mockResolvedValue(updated),
      findOne: jest.fn(),
    };

    const service = new BookingService(bookingModelMock as any);

    const bookingId = faker.database.mongodbObjectId();
    const patch = { status: BookingStatus.CONFIRMED };

    const result = await service.updateBookingById(bookingId, patch as any);

    expect(bookingModelMock.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(bookingModelMock.findByIdAndUpdate).toHaveBeenCalledWith(bookingId, patch, { new: true });
    expect(result).toBe(updated);
  });

  it('should return null when updateBookingById does not find a booking', async () => {
    const bookingModelMock = {
      create: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn().mockResolvedValue(null),
      findOne: jest.fn(),
    };

    const service = new BookingService(bookingModelMock as any);

    const bookingId = faker.database.mongodbObjectId();
    const patch = { status: BookingStatus.CANCELLED };

    const result = await service.updateBookingById(bookingId, patch as any);

    expect(bookingModelMock.findByIdAndUpdate).toHaveBeenCalledWith(bookingId, patch, { new: true });
    expect(result).toBeNull();
  });
});
