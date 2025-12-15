const createMock = jest.fn();
const retrieveMock = jest.fn();

const StripeConstructorMock = jest.fn().mockImplementation(() => ({
  paymentIntents: {
    create: createMock,
    retrieve: retrieveMock,
  },
}));

jest.mock('stripe', () => ({
  __esModule: true,
  default: StripeConstructorMock,
}));

import type { Env } from '../../configs/envs/validation';
import type Stripe from 'stripe';

import { faker } from '@faker-js/faker';

import { StripeService } from '../stripe';

describe('StripeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const envs: Env = {
    MONGODB_URI: faker.internet.url(),
    NODE_ENV: 'development',
    PORT: faker.number.int({ max: 65535, min: 1 }),
    STRIPE_SECRET_KEY: `sk_test_${faker.string.alphanumeric(24)}`,
  };

  it('should initialize the Stripe SDK with the secret key and expected API version', () => {
    new StripeService(envs);

    expect(StripeConstructorMock).toHaveBeenCalledTimes(1);
    expect(StripeConstructorMock).toHaveBeenCalledWith(envs.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });
  });

  it('should call stripe.paymentIntents.create with the expected payload', async () => {
    const service = new StripeService(envs);

    const amount = faker.number.int({ max: 50_000, min: 1 });
    const currency = faker.helpers.arrayElement(['eur', 'usd', 'gbp']);
    const paymentMethodTypes = ['card'];

    const mockedResponse = {
      client_secret: `pi_${faker.string.alphanumeric(12)}_secret_${faker.string.alphanumeric(24)}`,
      id: `pi_${faker.string.alphanumeric(12)}`,
      status: 'requires_payment_method',
    } as unknown as Stripe.Response<Stripe.PaymentIntent>;

    createMock.mockResolvedValue(mockedResponse);

    const result = await service.createPaymentIntent(amount, currency, paymentMethodTypes);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      amount,
      currency,
      payment_method_types: paymentMethodTypes,
    });
    expect(result).toBe(mockedResponse);
  });

  it('should call stripe.paymentIntents.retrieve with the paymentIntentId', async () => {
    const service = new StripeService(envs);

    const paymentIntentId = `pi_${faker.string.alphanumeric(12)}`;

    const mockedPaymentIntent = {
      id: paymentIntentId,
      status: 'succeeded',
    } as unknown as Stripe.PaymentIntent;

    retrieveMock.mockResolvedValue(mockedPaymentIntent);

    const result = await service.retrievePaymentIntent(paymentIntentId);

    expect(retrieveMock).toHaveBeenCalledTimes(1);
    expect(retrieveMock).toHaveBeenCalledWith(paymentIntentId);
    expect(result).toBe(mockedPaymentIntent);
  });

  it('should return true when status is "succeeded"', () => {
    const service = new StripeService(envs);

    const pi = { status: 'succeeded' } as unknown as Stripe.PaymentIntent;
    expect(service.isSucceeded(pi)).toBe(true);
  });

  it('should return false for any non-succeeded status', () => {
    const service = new StripeService(envs);

    const statuses: Stripe.PaymentIntent.Status[] = [
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'requires_capture',
      'canceled',
    ];

    for (const status of statuses) {
      const pi = { status } as unknown as Stripe.PaymentIntent;
      expect(service.isSucceeded(pi)).toBe(false);
    }
  });
});
