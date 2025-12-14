import type { BookingMongoDb } from '@libs/booking/common/validations/booking';

import { BookingStatus } from '@libs/booking/common/enums/status';
import { isAlignedToSlot } from '@libs/booking/common/utils/is-aligned-to-slot';
import { emailRegex } from '@libs/common/regex/email';
import { model, Schema } from 'mongoose';

/**
 * Mongoose schema for {@link BookingMongoDb}.
 *
 * @remarks
 * - `timestamps: true` adds `createdAt` and `updatedAt`.
 * - `optimisticConcurrency: true` helps prevent lost updates in concurrent writes.
 * - `strict: 'throw'` rejects unknown fields at save-time.
 */
export const bookingModel = new Schema<BookingMongoDb>(
  {
    /**
     * Customer email address.
     *
     * @remarks
     * - Stored in lowercase for consistent lookups.
     * - Validated against {@link emailRegex}.
     */
    email: {
      lowercase: true,
      match: [emailRegex, '"email" must be a valid email'],
      maxlength: [120, '"email" must be at most 120 characters long'],
      required: [true, '"email" is required'],
      trim: true,
      type: String,
    },

    /**
     * Customer full name.
     *
     * @minLength 2
     * @maxLength 120
     */
    name: {
      maxlength: [120, '"name" must be at most 120 characters long'],
      minlength: [2, '"name" must be at least 2 characters long'],
      required: [true, '"name" is required'],
      trim: true,
      type: String,
    },

    /**
     * Slot start date/time (UTC).
     *
     * @remarks
     * Must align exactly to the slot boundary configured by the system
     * (e.g. 30 minutes). The alignment check is performed by {@link isAlignedToSlot}.
     *
     * Store in UTC. Convert to/from local time at the API boundary.
     */
    startDate: {
      required: [true, '"startDate" is required'],
      type: Date,
      validate: {
        message: '"startDate" must be aligned to 30-minute boundaries (e.g. HH:00:00.000 or HH:30:00.000, UTC)',
        validator: (value: unknown): boolean => value instanceof Date && isAlignedToSlot(value),
      },
    },

    /**
     * Booking status.
     *
     * @remarks
     * Defaults to {@link BookingStatus.PENDING}.
     */
    status: {
      default: BookingStatus.PENDING,
      enum: {
        message: `"status" must be one of: ${Object.values(BookingStatus).join(', ')}`,
        values: Object.values(BookingStatus),
      },
      index: true,
      type: String,
    },
  },
  { collection: 'bookings', optimisticConcurrency: true, strict: true, timestamps: true },
);

/**
 * Prevent double-booking for the same slot start.
 *
 * @remarks
 * This enforces a single booking per startDate globally.
 */
bookingModel.index({ startDate: 1 }, { unique: true });

export const BookingModel = model<BookingMongoDb>('bookings', bookingModel);
