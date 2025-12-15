/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BookingMongoDb } from '@libs/booking/common/validations/booking-mongodb';

import { faker } from '@faker-js/faker';
import { BookingStatus } from '@libs/booking/common/enums/status';

type HandlerCtx = any;

const routerMock = jest.fn((contract: unknown, impl: any) => impl);

jest.mock('../../configs/server', () => ({
  server: {
    router: (contract: unknown, impl: any): any => routerMock(contract, impl),
  },
}));
jest.mock('../../configs/envs/env', () => ({
  env: { MONGODB_URI: 'mongodb://mock', NODE_ENV: 'development', PORT: 3000, STRIPE_SECRET_KEY: 'sk_test_mock' },
}));

const bookingServiceMock = {
  createBooking: jest.fn(),
  getBookingByFilter: jest.fn(),
  getBookingsByRange: jest.fn(),
  updateBookingById: jest.fn(),
};
jest.mock('../../services/booking', () => ({
  BookingService: jest.fn().mockImplementation(() => bookingServiceMock),
}));
const stripeServiceMock = {
  createPaymentIntent: jest.fn(),
  isSucceeded: jest.fn(),
  retrievePaymentIntent: jest.fn(),
};
jest.mock('../../services/stripe', () => ({
  StripeService: jest.fn().mockImplementation(() => stripeServiceMock),
}));

jest.mock('@libs/booking/common/constants/booking-price', () => ({ BOOKING_PRICE_IN_CENTS: 1500 }));
jest.mock('@libs/booking/common/constants/payment-currency', () => ({ PAYMENT_CURRENCY: 'eur' }));
jest.mock('@libs/booking/common/constants/payment-types', () => ({ PAYMENT_TYPES: ['card'] }));
jest.mock('@libs/booking/common/constants/booking-time', () => ({ BOOKING_TIME_MS: 30 * 60 * 1000 }));
jest.mock('@libs/booking/common/constants/business-time', () => ({
  BUSINESS_END_MS: 18 * 60 * 60 * 1000,
  BUSINESS_START_MS: 9 * 60 * 60 * 1000,
}));
jest.mock('@libs/booking/common/contracts/booking', () => ({
  bookingContract: {},
}));
const generateBusinessSlotsMock = jest.fn();
const slotKeyMock = jest.fn();
jest.mock('@libs/booking/common/utils/slots', () => ({
  generateBusinessSlots: (...args: any[]): any => generateBusinessSlotsMock(...args),
  slotKey: (...args: any[]): any => slotKeyMock(...args),
}));
jest.mock('@libs/booking/server/models/booking', () => ({
  BookingModel: {},
}));

describe('bookingRouter handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const importRouter = async (): Promise<Record<string, (ctx: HandlerCtx) => Promise<any>>> => {
    const mod = await import('../booking');

    return mod.bookingRouter as Record<string, (ctx: HandlerCtx) => Promise<any>>;
  };

  const makeBooking = (overrides: Partial<BookingMongoDb> = {}): Partial<BookingMongoDb> => ({
    _id: faker.database.mongodbObjectId(),
    dateTime: faker.date.anytime(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    paymentIntentId: undefined,
    status: BookingStatus.PENDING,
    ...overrides,
  });

  describe('cancelBooking', () => {
    it('should return 404 when booking does not exist', async () => {
      const bookingRouter = await importRouter();

      bookingServiceMock.updateBookingById.mockResolvedValueOnce(null);

      const bookingId = faker.database.mongodbObjectId();
      const result = await bookingRouter.cancelBooking({ params: { bookingId } });

      expect(bookingServiceMock.updateBookingById).toHaveBeenCalledWith(bookingId, {
        status: BookingStatus.CANCELLED,
      });

      expect(result).toEqual({
        body: { message: 'Booking not found' },
        status: 404,
      });
    });

    it('should return 200 with booking status when updated', async () => {
      const bookingRouter = await importRouter();

      const updated = makeBooking({ status: BookingStatus.CANCELLED });
      bookingServiceMock.updateBookingById.mockResolvedValueOnce(updated);

      const bookingId = faker.database.mongodbObjectId();
      const result = await bookingRouter.cancelBooking({ params: { bookingId } });

      expect(result).toEqual({
        body: { bookingStatus: BookingStatus.CANCELLED },
        status: 200,
      });
    });
  });

  describe('confirmBooking', () => {
    it('should return 404 when booking is not found', async () => {
      const bookingRouter = await importRouter();

      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(null);

      const bookingId = faker.database.mongodbObjectId();
      const result = await bookingRouter.confirmBooking({ params: { bookingId } });

      expect(bookingServiceMock.getBookingByFilter).toHaveBeenCalledWith({ _id: bookingId });
      expect(result).toEqual({ body: { message: 'Booking not found' }, status: 404 });
    });

    it('should return 400 when paymentIntentId is missing', async () => {
      const bookingRouter = await importRouter();

      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(makeBooking({ paymentIntentId: undefined }));

      const bookingId = faker.database.mongodbObjectId();
      const result = await bookingRouter.confirmBooking({ params: { bookingId } });

      expect(result).toEqual({ body: { message: 'Booking payment not processed' }, status: 400 });
      expect(stripeServiceMock.retrievePaymentIntent).not.toHaveBeenCalled();
    });

    it('should return 400 when payment is not succeeded', async () => {
      const bookingRouter = await importRouter();

      const booking = makeBooking({ paymentIntentId: `pi_${faker.string.alphanumeric(10)}` });
      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(booking);

      const paymentIntent = { id: booking.paymentIntentId, status: 'processing' };
      stripeServiceMock.retrievePaymentIntent.mockResolvedValueOnce(paymentIntent);
      stripeServiceMock.isSucceeded.mockReturnValueOnce(false);

      const result = await bookingRouter.confirmBooking({ params: { bookingId: booking._id } });

      expect(stripeServiceMock.retrievePaymentIntent).toHaveBeenCalledWith(booking.paymentIntentId);
      expect(stripeServiceMock.isSucceeded).toHaveBeenCalledWith(paymentIntent);
      expect(result).toEqual({ body: { message: 'Payment not succeeded' }, status: 400 });
      expect(bookingServiceMock.updateBookingById).not.toHaveBeenCalledWith(booking._id, {
        status: BookingStatus.CONFIRMED,
      });
    });

    it('should update booking to CONFIRMED and return 200 when payment succeeded', async () => {
      const bookingRouter = await importRouter();

      const booking = makeBooking({ paymentIntentId: `pi_${faker.string.alphanumeric(10)}` });
      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(booking);

      const paymentIntent = { id: booking.paymentIntentId, status: 'succeeded' };
      stripeServiceMock.retrievePaymentIntent.mockResolvedValueOnce(paymentIntent);
      stripeServiceMock.isSucceeded.mockReturnValueOnce(true);

      const updated = makeBooking({ _id: booking._id, status: BookingStatus.CONFIRMED });
      bookingServiceMock.updateBookingById.mockResolvedValueOnce(updated);

      const result = await bookingRouter.confirmBooking({ params: { bookingId: booking._id } });

      expect(bookingServiceMock.updateBookingById).toHaveBeenCalledWith(booking._id, {
        status: BookingStatus.CONFIRMED,
      });

      expect(result).toEqual({
        body: { bookingStatus: BookingStatus.CONFIRMED },
        status: 200,
      });
    });
  });

  describe('createBooking', () => {
    it('should create a new booking when slot is free', async () => {
      const bookingRouter = await importRouter();

      const payload = {
        dateTime: faker.date.anytime(),
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        status: BookingStatus.PENDING,
      };

      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(null);
      const created = makeBooking({ ...payload });
      bookingServiceMock.createBooking.mockResolvedValueOnce(created);

      const result = await bookingRouter.createBooking({ body: payload });

      expect(bookingServiceMock.getBookingByFilter).toHaveBeenCalledWith({ dateTime: payload.dateTime });
      expect(bookingServiceMock.createBooking).toHaveBeenCalledWith(payload);

      expect(result).toEqual({ body: created, status: 201 });
    });

    it('should reactivate a CANCELLED booking (set PENDING) for the same slot', async () => {
      const bookingRouter = await importRouter();

      const dateTime = faker.date.anytime();
      const existing = makeBooking({ dateTime, status: BookingStatus.CANCELLED });

      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(existing);

      const payload = {
        dateTime,
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        status: BookingStatus.PENDING,
      };

      const updated = makeBooking({ _id: existing._id, ...payload, status: BookingStatus.PENDING });
      bookingServiceMock.updateBookingById.mockResolvedValueOnce(updated);

      const result = await bookingRouter.createBooking({ body: payload });

      expect(bookingServiceMock.updateBookingById).toHaveBeenCalledWith(existing._id, {
        ...payload,
        status: BookingStatus.PENDING,
      });
      expect(result).toEqual({ body: updated, status: 201 });
    });

    it('should reject when slot is already booked and active', async () => {
      const bookingRouter = await importRouter();

      const existing = makeBooking({ status: BookingStatus.PENDING });
      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(existing);

      const payload = {
        dateTime: existing.dateTime,
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        status: BookingStatus.PENDING,
      };

      const result = await bookingRouter.createBooking({ body: payload });

      expect(result).toEqual({ body: { message: 'Slot already booked' }, status: 400 });
      expect(bookingServiceMock.createBooking).not.toHaveBeenCalled();
      expect(bookingServiceMock.updateBookingById).not.toHaveBeenCalled();
    });
  });

  describe('listAvailableSlots', () => {
    it('should return business slots excluding booked (non-cancelled) ones', async () => {
      const bookingRouter = await importRouter();

      const startDate = new Date(Date.UTC(2025, 0, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(2025, 0, 2, 0, 0, 0));

      const bookedActive = makeBooking({
        dateTime: new Date(Date.UTC(2025, 0, 1, 10, 0, 0)),
        status: BookingStatus.PENDING,
      });
      const bookedCancelled = makeBooking({
        dateTime: new Date(Date.UTC(2025, 0, 1, 10, 30, 0)),
        status: BookingStatus.CANCELLED,
      });

      bookingServiceMock.getBookingsByRange.mockResolvedValueOnce([bookedActive, bookedCancelled]);

      const slot1 = { slot: new Date(Date.UTC(2025, 0, 1, 10, 0, 0)) };
      const slot2 = { slot: new Date(Date.UTC(2025, 0, 1, 10, 30, 0)) };
      const slot3 = { slot: new Date(Date.UTC(2025, 0, 1, 11, 0, 0)) };

      generateBusinessSlotsMock.mockReturnValueOnce([slot1, slot2, slot3]);
      slotKeyMock.mockImplementation((d: Date) => d.getTime());

      const result = await bookingRouter.listAvailableSlots({ query: { endDate, startDate } });

      expect(bookingServiceMock.getBookingsByRange).toHaveBeenCalledWith({ endDate, startDate });
      expect(generateBusinessSlotsMock).toHaveBeenCalledTimes(1);
      expect(result.status).toBe(200);
      expect(result.body).toEqual([slot2, slot3]);
    });
  });

  describe('listBookedSlots', () => {
    it('should return bookings in range', async () => {
      const bookingRouter = await importRouter();

      const startDate = faker.date.past();
      const endDate = faker.date.future();

      const bookings = [makeBooking(), makeBooking()];
      bookingServiceMock.getBookingsByRange.mockResolvedValueOnce(bookings);

      const result = await bookingRouter.listBookedSlots({ query: { endDate, startDate } });

      expect(bookingServiceMock.getBookingsByRange).toHaveBeenCalledWith({ endDate, startDate });
      expect(result).toEqual({ body: bookings, status: 200 });
    });
  });

  describe('processPayment', () => {
    it('should return 404 when booking is not found', async () => {
      const bookingRouter = await importRouter();

      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(null);

      const bookingId = faker.database.mongodbObjectId();
      const result = await bookingRouter.processPayment({ params: { bookingId } });

      expect(result).toEqual({ body: { message: 'Booking not found' }, status: 404 });
      expect(stripeServiceMock.createPaymentIntent).not.toHaveBeenCalled();
    });

    it('should return 400 when booking is already CONFIRMED', async () => {
      const bookingRouter = await importRouter();

      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(makeBooking({ status: BookingStatus.CONFIRMED }));

      const bookingId = faker.database.mongodbObjectId();
      const result = await bookingRouter.processPayment({ params: { bookingId } });

      expect(result).toEqual({ body: { message: 'Booking already paid' }, status: 400 });
      expect(stripeServiceMock.createPaymentIntent).not.toHaveBeenCalled();
    });

    it('should create payment intent, store paymentIntentId, and return clientSecret', async () => {
      const bookingRouter = await importRouter();

      const booking = makeBooking({ status: BookingStatus.PENDING });
      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(booking);

      const paymentIntent = {
        client_secret: `pi_secret_${faker.string.alphanumeric(24)}`,
        id: `pi_${faker.string.alphanumeric(10)}`,
      };
      stripeServiceMock.createPaymentIntent.mockResolvedValueOnce(paymentIntent);

      bookingServiceMock.updateBookingById.mockResolvedValueOnce(
        makeBooking({ _id: booking._id, paymentIntentId: paymentIntent.id }),
      );

      const result = await bookingRouter.processPayment({ params: { bookingId: booking._id } });

      expect(stripeServiceMock.createPaymentIntent).toHaveBeenCalledWith(1500, 'eur', ['card']);
      expect(bookingServiceMock.updateBookingById).toHaveBeenCalledWith(booking._id, {
        paymentIntentId: paymentIntent.id,
      });

      expect(result).toEqual({
        body: { clientSecret: paymentIntent.client_secret },
        status: 200,
      });
    });

    it('should return empty clientSecret string when Stripe does not provide it', async () => {
      const bookingRouter = await importRouter();

      const booking = makeBooking({ status: BookingStatus.PENDING });
      bookingServiceMock.getBookingByFilter.mockResolvedValueOnce(booking);

      const paymentIntent = { client_secret: null, id: `pi_${faker.string.alphanumeric(10)}` };
      stripeServiceMock.createPaymentIntent.mockResolvedValueOnce(paymentIntent);

      const result = await bookingRouter.processPayment({ params: { bookingId: booking._id } });

      expect(result).toEqual({
        body: { clientSecret: '' },
        status: 200,
      });
    });
  });
});
