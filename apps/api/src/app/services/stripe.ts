import type { Env } from '../configs/envs/validation';

import Stripe from 'stripe';

/**
 * Service responsible for interacting with Stripe APIs.
 *
 * @remarks
 * This service wraps the Stripe SDK and exposes a small, focused API
 * used by the booking system to:
 * - Create PaymentIntents
 * - Retrieve PaymentIntents
 * - Evaluate whether a payment has succeeded
 *
 * The Stripe secret key is injected through {@link Env} and must never be
 * exposed to client applications.
 */
export class StripeService {
  private readonly stripeService: Stripe;

  constructor(envs: Env) {
    const { STRIPE_SECRET_KEY } = envs;

    this.stripeService = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });
  }

  /**
   * Creates a Stripe PaymentIntent.
   *
   * @param amount - Amount to charge in the smallest currency unit (e.g. cents).
   * @param currency - ISO currency code (e.g. `eur`, `usd`).
   * @param paymentMethodTypes - Allowed payment method types (e.g. `['card']`).
   *
   * @returns The Stripe PaymentIntent creation response.
   */
  public async createPaymentIntent(
    amount: number,
    currency: string,
    paymentMethodTypes: string[],
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return await this.stripeService.paymentIntents.create({
      amount,
      currency,
      payment_method_types: paymentMethodTypes,
    });
  }

  /**
   * Checks whether a payment has succeeded.
   *
   * @param paymentIntent - Stripe PaymentIntent to evaluate.
   *
   * @returns `true` if the PaymentIntent status is `succeeded`, otherwise `false`.
   */
  public isSucceeded(paymentIntent: Stripe.PaymentIntent): boolean {
    return paymentIntent.status === 'succeeded';
  }

  /**
   * Retrieves a Stripe PaymentIntent by its identifier.
   *
   * @param paymentIntentId - PaymentIntent identifier.
   *
   * @returns The corresponding Stripe PaymentIntent.
   */
  public async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await this.stripeService.paymentIntents.retrieve(paymentIntentId);
  }
}
