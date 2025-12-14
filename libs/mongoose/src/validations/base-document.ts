import z from 'zod';

import { objectIdRegex } from '../regex/object-id';

/**
 * Base Zod schema representing common MongoDB document properties.
 *
 * @remarks
 * This schema is intended to be extended by other domain schemas that
 * represent persisted MongoDB documents.
 *
 * It enforces:
 * - A valid MongoDB `_id` expressed as a 24-character hexadecimal string.
 * - Standard timestamp fields (`createdAt`, `updatedAt`) as JavaScript `Date` objects.
 *
 * This schema should be used at the API, DTO, or contract layer to ensure
 * data integrity before interacting with the persistence layer.
 */
export const baseDocumentSchema = z.object({
  /**
   * Unique MongoDB document identifier.
   *
   * Must be a valid 24-character hexadecimal ObjectId string.
   */
  _id: z.string('"_id" must be a string').regex(objectIdRegex, '"_id" must be a valid ObjectId'),

  /**
   * Timestamp indicating when the document was created.
   */
  createdAt: z.date('"createdAt" must be a valid date'),

  /**
   * Timestamp indicating when the document was last updated.
   */
  updatedAt: z.date('"updatedAt" must be a valid date'),
});

/**
 * Type inferred from {@link baseDocumentSchema}.
 *
 * Represents the base shape of a MongoDB document within the application.
 */
export type BaseDocument = z.infer<typeof baseDocumentSchema>;
