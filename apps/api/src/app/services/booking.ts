import type { BookingMongoDb } from '@libs/booking/common/validations/booking-mongodb';
import type { BookingMutate } from '@libs/booking/common/validations/booking-mutate';
import type { BookingQuerySearch } from '@libs/booking/common/validations/booking-query';
import type { BookingModel } from '@libs/booking/server/models/booking';
import type { QueryFilter } from 'mongoose';

/**
 * Service responsible for booking persistence and retrieval.
 *
 * @remarks
 * This service encapsulates all direct interactions with the Booking
 * Mongoose model and provides a clean API for higher layers such as
 * controllers and routers.
 *
 * Responsibilities:
 * - Create new bookings
 * - Query bookings by arbitrary filters
 * - Retrieve bookings within a date range
 * - Update bookings by identifier
 *
 * Business rules (e.g. slot availability, payment validation) are
 * enforced at higher layers and not inside this service.
 */
export class BookingService {
  private readonly bookingModel: typeof BookingModel;

  constructor(bookingModel: typeof BookingModel) {
    this.bookingModel = bookingModel;
  }

  /**
   * Creates a new booking.
   *
   * @param data - Validated booking payload used to create the booking.
   *
   * @returns The newly created booking document as stored in MongoDB.
   *
   * @remarks
   * - Assumes the payload has already been validated at the API boundary.
   * - Database-level constraints (e.g. unique slot index) are enforced
   *   by the persistence layer.
   */
  public async createBooking(data: BookingMutate): Promise<BookingMongoDb> {
    return await this.bookingModel.create(data);
  }

  /**
   * Retrieves a single booking matching the given filter.
   *
   * @param query - Mongoose query filter used to locate the booking.
   *
   * @returns
   * - The matching booking document if found.
   * - `null` if no booking matches the filter.
   *
   * @remarks
   * Intended for lookups by ID, slot date/time, or other indexed fields.
   */
  public async getBookingByFilter(query: QueryFilter<BookingMongoDb>): Promise<BookingMongoDb | null> {
    return await this.bookingModel.findOne(query);
  }

  /**
   * Retrieves all bookings within a given date/time range.
   *
   * @param range - Object containing the inclusive start and end dates.
   *
   * @returns An array of booking documents within the specified range.
   *
   * @remarks
   * - The range is inclusive of both `startDate` and `endDate`.
   * - Typically used to:
   *   - Determine slot availability
   *   - List booked appointments
   */
  public async getBookingsByRange(range: BookingQuerySearch): Promise<BookingMongoDb[]> {
    const { endDate, startDate } = range;

    return await this.bookingModel.find({ dateTime: { $gte: startDate, $lte: endDate } });
  }

  /**
   * Updates an existing booking by its identifier.
   *
   * @param bookingId - MongoDB ObjectId of the booking.
   * @param data - Partial booking fields to update.
   *
   * @returns
   * - The updated booking document.
   * - `null` if no booking with the given ID exists.
   *
   * @remarks
   * - Uses `{ new: true }` to return the updated document.
   * - Optimistic concurrency control is handled by the Mongoose schema.
   */
  public async updateBookingById(bookingId: string, data: Partial<BookingMongoDb>): Promise<BookingMongoDb | null> {
    return await this.bookingModel.findByIdAndUpdate(bookingId, data, { new: true });
  }
}
