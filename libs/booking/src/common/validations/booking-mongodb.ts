import type { z } from 'zod';

import { baseDocumentSchema } from '@libs/mongoose/validations/base-document';

import { bookingMutateSchema } from './booking-mutate';

/**
 * Zod schema representing a booking document as stored in MongoDB.
 *
 * @remarks
 * Extends {@link bookingSchema} with base MongoDB document fields
 * such as `_id`, `createdAt`, and `updatedAt`.
 */
export const bookingMongoDbSchema = bookingMutateSchema.extend(baseDocumentSchema.shape).strict();

/**
 * Booking MongoDB document type inferred from {@link bookingMongoDbSchema}.
 *
 * @remarks
 * Used when reading from or writing to the database.
 */
export type BookingMongoDb = z.infer<typeof bookingMongoDbSchema>;
