import { z } from 'zod';

/**
 * Schema representing the payment initialization response for a booking.
 *
 * @remarks
 * This payload is typically returned after creating a payment intent with a payment provider.
 * The `clientSecret` must be passed to the client application to complete the
 * payment confirmation using the provider’s SDK.
 *
 * Security notes:
 * - This schema does **not** contain any server secrets.
 * - The `clientSecret` is safe to send to the client but must still be handled carefully.
 */
export const bookingPaymentSchema = z
  .object({
    /**
     * Provider-specific client secret used to confirm the payment on the client.
     *
     * @remarks
     * - Must be a non-empty string.
     */
    clientSecret: z
      .string({ message: '"clientSecret" must be a string' })
      .min(1, '"clientSecret" must be a valid secret'),
  })
  .strict();

/**
 * TypeScript representation of the booking payment initialization payload.
 *
 * @see {@link bookingPaymentSchema}
 */
export type BookingPayment = z.infer<typeof bookingPaymentSchema>;
