/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import { NodeEnv } from '@libs/common/enums/node-env';

import { envValidationSchema } from '../validation';

describe('envValidation', () => {
  const baseInput = {
    MONGODB_URI: faker.internet.url(),
    NODE_ENV: NodeEnv.DEVELOPMENT,
    PORT: String(faker.number.int({ max: 65535, min: 1 })),
    STRIPE_SECRET_KEY: `sk_test_${faker.string.alphanumeric(24)}`,
  };

  it('should successfully parse a valid environment object', () => {
    const result = envValidationSchema.parse(baseInput);

    expect(result).toEqual({
      MONGODB_URI: baseInput.MONGODB_URI,
      NODE_ENV: baseInput.NODE_ENV,
      PORT: Number(baseInput.PORT),
      STRIPE_SECRET_KEY: baseInput.STRIPE_SECRET_KEY,
    });
    expect(typeof result.PORT).toBe('number');
    expect(Number.isFinite(result.PORT)).toBe(true);
  });

  it('should reject when "MONGODB_URI" is missing', () => {
    const { MONGODB_URI, ...input } = baseInput;

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'MONGODB_URI');

      expect(issue).toBeTruthy();
    }
  });

  it('should reject when "MONGODB_URI" is an empty string', () => {
    const parsed = envValidationSchema.safeParse({ ...baseInput, MONGODB_URI: '' });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'MONGODB_URI');

      expect(issue).toBeTruthy();
      expect(issue?.message).toBe('"MONGODB_URI" is required');
    }
  });

  it('should reject when "NODE_ENV" is missing', () => {
    const { NODE_ENV, ...input } = baseInput;

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'NODE_ENV');

      expect(issue).toBeTruthy();
    }
  });

  it('should reject when "NODE_ENV" is not one of the allowed values and include the custom message', () => {
    const parsed = envValidationSchema.safeParse({
      ...baseInput,
      NODE_ENV: faker.string.sample(6),
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'NODE_ENV');

      expect(issue).toBeTruthy();
      expect(issue?.message).toContain('"NODE_ENV" must be one of the following:');
      for (const value of Object.values(NodeEnv)) {
        expect(issue?.message).toContain(value);
      }
    }
  });

  it('should reject when "PORT" is missing', () => {
    const { PORT, ...input } = baseInput;

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'PORT');

      expect(issue).toBeTruthy();
    }
  });

  it('should reject when "PORT" is not a valid number', () => {
    const parsed = envValidationSchema.safeParse({
      ...baseInput,
      PORT: faker.string.alpha({ length: { max: 12, min: 1 } }),
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'PORT');

      expect(issue).toBeTruthy();
      expect(issue?.message).toBe('Must be a valid number');
    }
  });

  it('should reject when "STRIPE_SECRET_KEY" is missing', () => {
    const { STRIPE_SECRET_KEY, ...input } = baseInput;

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'STRIPE_SECRET_KEY');

      expect(issue).toBeTruthy();
    }
  });

  it('should reject when "STRIPE_SECRET_KEY" is an empty string', () => {
    const parsed = envValidationSchema.safeParse({
      ...baseInput,
      STRIPE_SECRET_KEY: '',
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'STRIPE_SECRET_KEY');

      expect(issue).toBeTruthy();
      expect(issue?.message).toBe('"STRIPE_SECRET_KEY" is required');
    }
  });

  it('should reject when multiple fields are invalid and report all of them', () => {
    const parsed = envValidationSchema.safeParse({
      MONGODB_URI: '',
      NODE_ENV: faker.string.sample(6),
      PORT: 'NaN',
      STRIPE_SECRET_KEY: '',
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const paths = parsed.error.issues.map(i => i.path.join('.'));

      expect(paths).toContain('MONGODB_URI');
      expect(paths).toContain('NODE_ENV');
      expect(paths).toContain('PORT');
      expect(paths).toContain('STRIPE_SECRET_KEY');
    }
  });
});
