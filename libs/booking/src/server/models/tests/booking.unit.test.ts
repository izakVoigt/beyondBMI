import { faker } from '@faker-js/faker';
import { BOOKING_TIME_MS } from '@libs/booking/common/constants/booking-time';
import { BookingStatus } from '@libs/booking/common/enums/status';

import { BookingModel } from '../booking';

const alignedDate = (): Date => {
  const base = Date.UTC(2025, 0, 1, 10, 0, 0, 0);
  return new Date(base - (base % BOOKING_TIME_MS));
};

describe('BookingModel (Mongoose schema validation)', () => {
  it('should validate a valid document', () => {
    const doc = new BookingModel({
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      startDate: alignedDate(),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err).toBeUndefined();
  });

  it('should fail when email is missing', () => {
    const doc = new BookingModel({
      name: faker.person.fullName(),
      startDate: alignedDate(),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err?.errors['email']?.message).toBe('"email" is required');
  });

  it('should fail when email is invalid', () => {
    const doc = new BookingModel({
      email: 'invalid-email',
      name: faker.person.fullName(),
      startDate: alignedDate(),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err?.errors['email']?.message).toBe('"email" must be a valid email');
  });

  it('should fail when name is too short', () => {
    const doc = new BookingModel({
      email: faker.internet.email().toLowerCase(),
      name: 'A',
      startDate: alignedDate(),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err?.errors['name']?.message).toBe('"name" must be at least 2 characters long');
  });

  it('should fail when startDate is not aligned', () => {
    const doc = new BookingModel({
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      startDate: new Date(alignedDate().getTime() + 1),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err?.errors['startDate']?.message).toContain('"startDate" must be aligned');
  });

  it('should default status to PENDING when omitted', () => {
    const doc = new BookingModel({
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      startDate: alignedDate(),
    });

    expect(doc.status).toBe(BookingStatus.PENDING);
  });

  it('should fail when status is not in enum', () => {
    const doc = new BookingModel({
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      startDate: alignedDate(),
      status: 'invalid' as unknown as BookingStatus,
    });

    const err = doc.validateSync();

    expect(err?.errors['status']?.message).toContain('"status" must be one of:');
  });
});
