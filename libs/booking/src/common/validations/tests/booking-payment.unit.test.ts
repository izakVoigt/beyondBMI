import { faker } from '@faker-js/faker';

import { bookingPaymentSchema } from '../booking-payment';

describe('bookingPaymentSchema', () => {
  it('should pass with a valid clientSecret', () => {
    const clientSecret = `pi_${faker.string.alphanumeric(8)}_secret_${faker.string.alphanumeric(24)}`;
    const result = bookingPaymentSchema.safeParse({ clientSecret });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.clientSecret).toBe(clientSecret);
    }
  });

  it('should fail if clientSecret is missing', () => {
    const result = bookingPaymentSchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.join('.') === 'clientSecret');

      expect(issue).toBeTruthy();
    }
  });

  it('should fail if clientSecret is not a string (number)', () => {
    const result = bookingPaymentSchema.safeParse({ clientSecret: faker.number.int() });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.join('.') === 'clientSecret');

      expect(issue).toBeTruthy();
      expect(issue?.message).toBe('"clientSecret" must be a string');
    }
  });

  it('should fail if clientSecret is an empty string', () => {
    const result = bookingPaymentSchema.safeParse({ clientSecret: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.join('.') === 'clientSecret');

      expect(issue).toBeTruthy();
      expect(issue?.message).toBe('"clientSecret" must be a valid secret');
    }
  });

  it('should fail if extra fields are present (strict schema)', () => {
    const result = bookingPaymentSchema.safeParse({
      clientSecret: `pi_${faker.string.alphanumeric(8)}_secret_${faker.string.alphanumeric(24)}`,
      extra: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => /unrecognized key|unrecognized keys/i.test(i.message))).toBe(true);
    }
  });
});
