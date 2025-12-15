import { contractErrorSchema } from '@libs/common/validations/contract-error';
import { initContract } from '@ts-rest/core';

import { availableSlotArraySchema } from '../validations/available-slot';
import { bookingMongoDbArraySchema, bookingMongoDbSchema } from '../validations/booking-mongodb';
import { bookingMutateSchema } from '../validations/booking-mutate';
import { bookingPaymentSchema } from '../validations/booking-payment';
import { bookingQueryParamsSchema, bookingQuerySearchSchema } from '../validations/booking-query';
import { bookingStatusReturn } from '../validations/booking-status';

const contract = initContract();

/**
 * Booking contract for the ts-rest API.
 *
 * @remarks
 * This contract defines all backend routes related to the booking lifecycle,
 * including:
 * - Slot availability lookup
 * - Booking creation and cancellation
 * - Payment initialization and confirmation
 * - Querying booked appointments
 *
 * All routes are strongly typed using Zod schemas and are intended to be
 * consumed by web and mobile clients.
 */
export const bookingContract = contract.router({
  /**
   * Cancel an existing booking by its identifier.
   *
   * @method POST
   * @path /:bookingId/cancel
   *
   * @pathParams
   * - bookingId: MongoDB ObjectId identifying the booking
   *
   * @remarks
   * - A cancelled booking frees up its associated time slot.
   * - Cancelling an already cancelled booking is idempotent.
   *
   * @responses
   * - 200: Booking successfully cancelled
   * - 400: Invalid booking identifier
   * - 404: Booking not found
   */
  cancelBooking: {
    body: contract.type<void>(),
    method: 'POST',
    path: '/:bookingId/cancel',
    pathParams: bookingQueryParamsSchema,
    responses: {
      200: bookingStatusReturn,
      400: contractErrorSchema,
      404: contractErrorSchema,
    },
    summary: 'Cancel an existing booking',
  },

  /**
   * Confirm a booking after a successful payment.
   *
   * @method POST
   * @path /:bookingId/pay/confirm
   *
   * @pathParams
   * - bookingId: MongoDB ObjectId identifying the booking
   *
   * @remarks
   * - If the booking is already confirmed, the operation is idempotent.
   *
   * @responses
   * - 200: Booking payment confirmed and status updated
   * - 400: Payment not completed or invalid state
   * - 404: Booking not found
   */
  confirmBooking: {
    body: contract.type<void>(),
    method: 'POST',
    path: '/:bookingId/pay/confirm',
    pathParams: bookingQueryParamsSchema,
    responses: {
      200: bookingStatusReturn,
      400: contractErrorSchema,
      404: contractErrorSchema,
    },
    summary: 'Confirm booking payment',
  },

  /**
   * Create a new booking for a given time slot.
   *
   * @method POST
   * @path /book
   *
   * @remarks
   * - Bookings are created in a non-confirmed state until payment is completed.
   * - Attempting to book an already occupied slot results in a validation error.
   *
   * @responses
   * - 201: Booking successfully created
   * - 400: Slot already booked or invalid input
   */
  createBooking: {
    body: bookingMutateSchema,
    method: 'POST',
    path: '/book',
    responses: {
      201: bookingMongoDbSchema,
      400: contractErrorSchema,
    },
    summary: 'Create a new booking',
  },

  /**
   * List all available booking slots within a given date range.
   *
   * @method GET
   * @path /
   *
   * @remarks
   * - Slots are generated in fixed intervals (e.g. 30 minutes).
   * - Only slots within business hours are returned.
   * - Slots already booked (and not cancelled) are excluded.
   *
   * @responses
   * - 200: Array of available booking slots
   */
  listAvailableSlots: {
    method: 'GET',
    path: '/',
    query: bookingQuerySearchSchema,
    responses: {
      200: availableSlotArraySchema,
    },
    summary: 'List available booking slots',
  },

  /**
   * List all booked appointments within a given date range.
   *
   * @method GET
   * @path /booked
   *
   * @remarks
   * - Includes all bookings regardless of status.
   * - Intended for administrative or reporting purposes.
   *
   * @responses
   * - 200: Array of booked appointments
   */
  listBookedSlots: {
    method: 'GET',
    path: '/booked',
    query: bookingQuerySearchSchema,
    responses: {
      200: bookingMongoDbArraySchema,
    },
    summary: 'List booked appointments',
  },

  /**
   * Initialize payment for a given booking.
   *
   * @method POST
   * @path /:bookingId/pay
   *
   * @pathParams
   * - bookingId: MongoDB ObjectId identifying the booking
   *
   * @remarks
   * - Creates a payment intent with the payment provider.
   * - Does not immediately confirm the booking.
   * - The client is expected to complete the payment using the returned data.
   *
   * @responses
   * - 200: Payment initialized successfully
   * - 400: Invalid request or booking already paid
   * - 404: Booking not found
   */
  processPayment: {
    body: contract.type<void>(),
    method: 'POST',
    path: '/:bookingId/pay',
    pathParams: bookingQueryParamsSchema,
    responses: {
      200: bookingPaymentSchema,
      400: contractErrorSchema,
      404: contractErrorSchema,
    },
    summary: 'Initialize booking payment',
  },
});
