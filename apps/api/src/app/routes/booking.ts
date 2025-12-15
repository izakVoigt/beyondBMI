import type { BookingMongoDb } from '@libs/booking/common/validations/booking-mongodb';

import { BOOKING_PRICE_IN_CENTS } from '@libs/booking/common/constants/booking-price';
import { BOOKING_TIME_MS } from '@libs/booking/common/constants/booking-time';
import { BUSINESS_END_MS, BUSINESS_START_MS } from '@libs/booking/common/constants/business-time';
import { PAYMENT_CURRENCY } from '@libs/booking/common/constants/payment-currency';
import { PAYMENT_TYPES } from '@libs/booking/common/constants/payment-types';
import { bookingContract } from '@libs/booking/common/contracts/booking';
import { BookingStatus } from '@libs/booking/common/enums/status';
import { generateBusinessSlots, slotKey } from '@libs/booking/common/utils/slots';
import { BookingModel } from '@libs/booking/server/models/booking';

import { env } from '../configs/envs/env';
import { server } from '../configs/server';
import { BookingService } from '../services/booking';
import { StripeService } from '../services/stripe';

const bookingService = new BookingService(BookingModel);
const stripeService = new StripeService(env);

/**
 * Booking API router.
 *
 * @remarks
 * Implements all routes defined in {@link bookingContract}, including:
 * - Booking creation and cancellation
 * - Slot availability lookup
 * - Payment initialization and confirmation (Stripe)
 *
 * This router:
 * - Enforces compile-time request/response typing via ts-rest
 * - Applies domain rules (slot uniqueness, business hours, payment state)
 * - Delegates persistence and third-party concerns to dedicated services
 */
export const bookingRouter = server.router(bookingContract, {
  /**
   * Cancel an existing booking.
   *
   * @remarks
   * - Cancelling a booking frees its slot for future bookings.
   * - If the booking does not exist, a 404 is returned.
   * - The operation is idempotent for already-cancelled bookings.
   */
  cancelBooking: async ({ params: { bookingId } }) => {
    const booking = await bookingService.updateBookingById(bookingId, { status: BookingStatus.CANCELLED });

    if (!booking) {
      return {
        body: { message: 'Booking not found' },
        status: 404,
      };
    }

    return {
      body: { bookingStatus: booking.status },
      status: 200,
    };
  },

  /**
   * Confirm a booking after payment has been completed.
   *
   * @remarks
   * - Verifies that a payment intent exists for the booking.
   * - Retrieves the PaymentIntent from Stripe and checks for success.
   * - Only successful payments result in a CONFIRMED booking.
   */
  confirmBooking: async ({ params: { bookingId } }) => {
    const booking = await bookingService.getBookingByFilter({ _id: bookingId });

    if (!booking) {
      return { body: { message: 'Booking not found' }, status: 404 };
    }
    if (!booking.paymentIntentId) {
      return { body: { message: 'Booking payment not processed' }, status: 400 };
    }

    const paymentIntent = await stripeService.retrievePaymentIntent(booking.paymentIntentId);

    if (!stripeService.isSucceeded(paymentIntent)) {
      return { body: { message: 'Payment not succeeded' }, status: 400 };
    }

    const updatedBooking = await bookingService.updateBookingById(bookingId, { status: BookingStatus.CONFIRMED });

    return { body: { bookingStatus: (updatedBooking as BookingMongoDb).status }, status: 200 };
  },

  /**
   * Create a new booking for a given slot.
   *
   * @remarks
   * - If the slot is free, a new booking is created.
   * - If the slot exists but is CANCELLED, the booking is reactivated.
   * - If the slot is already booked and active, the request is rejected.
   *
   * Slot uniqueness is enforced both at application level and via a
   * unique database index.
   */
  createBooking: async ({ body }) => {
    const { dateTime } = body;

    const bookingExists = await bookingService.getBookingByFilter({ dateTime });

    if (!bookingExists) {
      const newBooking = await bookingService.createBooking(body);

      return { body: newBooking, status: 201 };
    }
    if (bookingExists.status === BookingStatus.CANCELLED) {
      const updatedBooking = await bookingService.updateBookingById(bookingExists._id, {
        ...body,
        status: BookingStatus.PENDING,
      });

      return { body: updatedBooking as BookingMongoDb, status: 201 };
    }

    return { body: { message: 'Slot already booked' }, status: 400 };
  },

  /**
   * List all available booking slots within a date range.
   *
   * @remarks
   * - Generates all possible slots within business hours.
   * - Excludes slots that are already booked (except CANCELLED bookings).
   * - Slot granularity is defined by {@link BOOKING_TIME_MS}.
   */
  listAvailableSlots: async ({ query }) => {
    const { endDate, startDate } = query;

    const bookedSlots = await bookingService.getBookingsByRange(query);

    const bookedSet = new Set(
      bookedSlots.filter(b => b.status !== BookingStatus.CANCELLED).map(b => slotKey(new Date(b.dateTime))),
    );

    const allSlots = generateBusinessSlots(startDate, endDate, BOOKING_TIME_MS, BUSINESS_START_MS, BUSINESS_END_MS);

    const available = allSlots.filter(s => !bookedSet.has(slotKey(s.slot)));

    return { body: available, status: 200 };
  },

  /**
   * List all booked slots within a date range.
   *
   * @remarks
   * - Returns all bookings, regardless of status.
   * - Intended primarily for administrative or reporting purposes.
   */
  listBookedSlots: async ({ query }) => {
    const bookedSlots = await bookingService.getBookingsByRange(query);

    return { body: bookedSlots, status: 200 };
  },

  /**
   * Initialize payment for a booking.
   *
   * @remarks
   * - Creates a PaymentIntent with Stripe.
   * - Stores the PaymentIntent ID on the booking.
   * - Returns the client secret required by the client to complete payment.
   *
   * This endpoint does not confirm the booking;
   * confirmation happens via {@link confirmBooking}.
   */
  processPayment: async ({ params: { bookingId } }) => {
    const booking = await bookingService.getBookingByFilter({ _id: bookingId });

    if (!booking) {
      return { body: { message: 'Booking not found' }, status: 404 };
    }
    if (booking.status === BookingStatus.CONFIRMED) {
      return { body: { message: 'Booking already paid' }, status: 400 };
    }

    const paymentIntent = await stripeService.createPaymentIntent(
      BOOKING_PRICE_IN_CENTS,
      PAYMENT_CURRENCY,
      PAYMENT_TYPES,
    );

    await bookingService.updateBookingById(bookingId, { paymentIntentId: paymentIntent.id });

    return { body: { clientSecret: paymentIntent.client_secret ?? '' }, status: 200 };
  },
});
