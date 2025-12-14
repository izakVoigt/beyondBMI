import { contractErrorSchema } from '@libs/common/validations/contract-error';
import { initContract } from '@ts-rest/core';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { availableSlotSchema } from '../validations/available-slot';
import { bookingMongoDbSchema } from '../validations/booking-mongodb';
import { bookingMutateSchema } from '../validations/booking-mutate';
import { bookingQueryParamsSchema } from '../validations/booking-query';
import { bookingStatusSchema } from '../validations/booking-status';

const contract = initContract();

/**
 * Booking contract for the ts-rest API.
 *
 * This contract defines all backend routes for the booking system,
 * including creation, cancellation, payment processing, and querying.
 */
export const bookingContract = contract.router({
  /**
   * Cancel a booking by its ID.
   *
   * @method POST
   * @path /:bookingId/cancel
   *
   * @pathParams
   * - bookingId: string (valid MongoDB ObjectId)
   *
   * @responses
   * - 200: Returns the updated booking status (typically CANCELLED)
   * - 400: Validation error (e.g., invalid ID)
   * - 404: Booking not found
   */
  cancelBooking: {
    body: contract.type<void>(),
    method: 'POST',
    path: '/:bookingId/cancel',
    pathParams: bookingQueryParamsSchema,
    responses: {
      [StatusCodes.OK]: z.object({ status: bookingStatusSchema }),
      [StatusCodes.BAD_REQUEST]: contractErrorSchema,
      [StatusCodes.NOT_FOUND]: contractErrorSchema,
    },
  },

  /**
   * Create a new booking.
   *
   * @method POST
   * @path /book
   *
   * @responses
   * - 201: Returns the created booking document
   */
  createBooking: {
    body: bookingMutateSchema,
    method: 'POST',
    path: '/book',
    responses: {
      [StatusCodes.CREATED]: bookingMongoDbSchema,
    },
  },

  /**
   * List available booking slots.
   *
   * @method GET
   * @path /
   *
   * @responses
   * - 200: Returns an array of available slots with metadata
   */
  listAvailableSlots: {
    method: 'GET',
    path: '/',
    responses: {
      [StatusCodes.OK]: z.array(availableSlotSchema),
    },
  },

  /**
   * List all booked appointments.
   *
   * @method GET
   * @path /booked
   *
   * @responses
   * - 200: Returns an array of all booked slots
   */
  listBookedSlots: {
    method: 'GET',
    path: '/booked',
    responses: {
      [StatusCodes.OK]: z.array(bookingMongoDbSchema),
    },
  },

  /**
   * Process payment for a given booking.
   *
   * @method POST
   * @path /:bookingId/pay
   *
   * @pathParams
   * - bookingId: string (valid MongoDB ObjectId)
   *
   * @responses
   * - 200: Returns the updated booking status (typically CONFIRMED)
   * - 400: Invalid request (e.g., already paid or payment failed)
   * - 404: Booking not found
   */
  processPayment: {
    body: contract.type<void>(),
    method: 'POST',
    path: '/:bookingId/pay',
    pathParams: bookingQueryParamsSchema,
    responses: {
      [StatusCodes.OK]: z.object({ status: bookingStatusSchema }),
      [StatusCodes.BAD_REQUEST]: contractErrorSchema,
      [StatusCodes.NOT_FOUND]: contractErrorSchema,
    },
  },
});
