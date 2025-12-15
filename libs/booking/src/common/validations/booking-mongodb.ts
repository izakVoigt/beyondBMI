import { baseDocumentSchema } from '@libs/mongoose/validations/base-document';
import { z } from 'zod';

import { bookingMutateSchema } from './booking-mutate';

const bookingPaymentInfoSchema = z
  .object({
    /**
     * Stripe PaymentIntent identifier associated with this booking.
     *
     * @remarks
     * - Present when a payment has been initialized for the booking.
     * - May be omitted for bookings that have not reached the payment stage yet.
     */
    paymentIntentId: z
      .string({ message: '"paymentIntentId" must be a string' })
      .min(1, '"paymentIntentId" must be a valid ID')
      .optional(),
  })
  .strict();

/**
 * Zod schema representing a booking document as stored in MongoDB.
 *
 * @remarks
 * This schema composes:
 * - {@link bookingMutateSchema} (domain booking fields supplied by clients)
 * - {@link baseDocumentSchema} (MongoDB metadata fields such as `_id`, `createdAt`, `updatedAt`)
 * - Payment metadata
 *
 * The schema is strict, meaning unknown properties are rejected.
 */
export const bookingMongoDbSchema = bookingMutateSchema
  .extend(baseDocumentSchema.shape)
  .extend(bookingPaymentInfoSchema.shape)
  .strict();

/**
 * TypeScript representation of a booking document stored in MongoDB.
 *
 * @see {@link bookingMongoDbSchema}
 */
export type BookingMongoDb = z.infer<typeof bookingMongoDbSchema>;

/**
 * Schema representing a collection of MongoDB booking documents.
 */
export const bookingMongoDbArraySchema = z.array(bookingMongoDbSchema);

/**
 * TypeScript representation of an array of MongoDB booking documents.
 *
 * @see {@link bookingMongoDbArraySchema}
 */
export type BookingMongoDbArray = z.infer<typeof bookingMongoDbArraySchema>;
