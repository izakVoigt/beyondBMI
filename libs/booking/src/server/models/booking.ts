import type { BookingMongoDb } from '@libs/booking/common/validations/booking-mongodb';

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
 * - `strict: true` rejects unknown fields at save-time.
 */
export const bookingModel = new Schema<BookingMongoDb>(
  {
    /**
     * Slot start date/time (UTC).
     *
     * @remarks
     * Must align exactly to the slot boundary configured by the system
     * (e.g. 30 minutes). Alignment is validated using {@link isAlignedToSlot}.
     *
     * Store in UTC. Convert to/from local time at the API boundary.
     */
    dateTime: {
      required: [true, '"dateTime" is required'],
      type: Date,
      validate: {
        message: '"dateTime" must be aligned to 30-minute boundaries (e.g. HH:00:00.000 or HH:30:00.000, UTC)',
        validator: (value: unknown): boolean => value instanceof Date && isAlignedToSlot(value),
      },
    },

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
      maxlength: [254, '"email" must be at most 254 characters long'],
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
     * Stripe PaymentIntent identifier associated with the booking payment.
     *
     * @remarks
     * - Present when payment has been initialized.
     * - May be absent for bookings that have not reached the payment stage.
     */
    paymentIntentId: {
      trim: true,
      type: String,
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
 * Enforces a single booking per slot start (`dateTime`) globally.
 */
bookingModel.index({ dateTime: 1 }, { unique: true });

export const BookingModel = model<BookingMongoDb>('bookings', bookingModel);
