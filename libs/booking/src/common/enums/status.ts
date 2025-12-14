/**
 * Represents the lifecycle status of a booking.
 *
 * @remarks
 * This enum defines all possible states a booking can be in,
 * from its creation to its final outcome.
 *
 * Typical lifecycle:
 * - {@link BookingStatus.PENDING} → booking has been created but not yet confirmed.
 * - {@link BookingStatus.CONFIRMED} → booking has been confirmed and the slot is reserved.
 * - {@link BookingStatus.COMPLETED} → booking has been successfully fulfilled.
 * - {@link BookingStatus.CANCELLED} → booking has been cancelled and the slot is released.
 */
export enum BookingStatus {
  /**
   * The booking has been cancelled and is no longer active.
   */
  CANCELLED = 'cancelled',

  /**
   * The booking has been confirmed and the time slot is reserved.
   */
  CONFIRMED = 'confirmed',

  /**
   * The booking has been completed successfully.
   *
   * @remarks
   * This status is typically set after the booked slot has elapsed.
   */
  COMPLETED = 'completed',

  /**
   * The booking has been created but not yet confirmed.
   *
   * @remarks
   * This is the default status for newly created bookings.
   */
  PENDING = 'pending',
}
