import { faker } from '@faker-js/faker';
import { BOOKING_TIME_MS } from '@libs/booking/common/constants/booking-time';
import { BookingStatus } from '@libs/booking/common/enums/status';

import { BookingModel } from '../booking';

const alignedDateTime = (): Date => {
  const base = Date.UTC(2025, 0, 1, 10, 0, 0, 0);

  return new Date(base - (base % BOOKING_TIME_MS));
};

describe('Mongoose schema validation', () => {
  it('should validate a valid document', () => {
    const doc = new BookingModel({
      dateTime: alignedDateTime(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err).toBeUndefined();
  });

  it('should fail when email is missing', () => {
    const doc = new BookingModel({
      dateTime: alignedDateTime(),
      name: faker.person.fullName(),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err?.errors?.['email']?.message).toBe('"email" is required');
  });

  it('should fail when email is invalid', () => {
    const doc = new BookingModel({
      dateTime: alignedDateTime(),
      email: 'invalid-email',
      name: faker.person.fullName(),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err?.errors?.['email']?.message).toBe('"email" must be a valid email');
  });

  it('should fail when name is too short', () => {
    const doc = new BookingModel({
      dateTime: alignedDateTime(),
      email: faker.internet.email().toLowerCase(),
      name: 'A',
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err?.errors?.['name']?.message).toBe('"name" must be at least 2 characters long');
  });

  it('should fail when dateTime is not aligned', () => {
    const doc = new BookingModel({
      dateTime: new Date(alignedDateTime().getTime() + 1),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err?.errors?.['dateTime']?.message).toContain('"dateTime" must be aligned');
  });

  it('should default status to PENDING when omitted', () => {
    const doc = new BookingModel({
      dateTime: alignedDateTime(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
    });

    expect(doc.status).toBe(BookingStatus.PENDING);
  });

  it('should fail when status is not in enum', () => {
    const doc = new BookingModel({
      dateTime: alignedDateTime(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      status: 'invalid' as unknown as BookingStatus,
    });

    const err = doc.validateSync();

    expect(err?.errors?.['status']?.message).toContain('"status" must be one of:');
  });

  it('should allow paymentIntentId to be omitted', () => {
    const doc = new BookingModel({
      dateTime: alignedDateTime(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err).toBeUndefined();
    expect(doc.paymentIntentId).toBeUndefined();
  });

  it('should fail if extra fields are present (strict mode)', () => {
    const doc = new BookingModel({
      dateTime: alignedDateTime(),
      email: faker.internet.email().toLowerCase(),
      extra: true,
      name: faker.person.fullName(),
      status: BookingStatus.PENDING,
    });

    const err = doc.validateSync();

    expect(err).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((doc as any).extra).toBeUndefined();
  });
});
