import { faker } from '@faker-js/faker';
import { NodeEnv } from '@libs/common/enums/node-env';
import { z } from 'zod';

describe('env config - getEnv/env', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  const baseInput = {
    MONGODB_URI: faker.internet.url(),
    NODE_ENV: NodeEnv.DEVELOPMENT,
    PORT: String(faker.number.int({ max: 65535, min: 1 })),
    STRIPE_SECRET_KEY: `sk_test_${faker.string.alphanumeric(24)}`,
  };

  it('should validate envs, freeze the result, and cache it in memory', async () => {
    process.env.MONGODB_URI = baseInput.MONGODB_URI;
    process.env.NODE_ENV = baseInput.NODE_ENV;
    process.env.PORT = baseInput.PORT;
    process.env.STRIPE_SECRET_KEY = baseInput.STRIPE_SECRET_KEY;

    const envModule = await import('../env');

    const first = envModule.getEnv();

    expect(first).toEqual({
      MONGODB_URI: baseInput.MONGODB_URI,
      NODE_ENV: baseInput.NODE_ENV,
      PORT: Number(baseInput.PORT),
      STRIPE_SECRET_KEY: baseInput.STRIPE_SECRET_KEY,
    });

    expect(Object.isFrozen(first)).toBe(true);

    const second = envModule.getEnv();

    expect(second).toBe(first);
    expect(envModule.env).toBe(first);
  });

  it('should only validate once (safeParse called once) when getEnv is called multiple times', async () => {
    process.env.MONGODB_URI = baseInput.MONGODB_URI;
    process.env.NODE_ENV = baseInput.NODE_ENV;
    process.env.PORT = baseInput.PORT;
    process.env.STRIPE_SECRET_KEY = baseInput.STRIPE_SECRET_KEY;

    const validationModule = await import('../validation');
    const spy = jest.spyOn(validationModule.envValidationSchema, 'safeParse');

    const envModule = await import('../env');

    envModule.getEnv();
    envModule.getEnv();
    envModule.getEnv();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should throw during module import when envs are invalid', async () => {
    process.env.NODE_ENV = baseInput.NODE_ENV;

    await expect(import('../env')).rejects.toThrow(/Invalid environment variables:/);
  });

  it('should include "(root)" in the error message when a Zod issue has an empty path', async () => {
    const validationModule = await import('../validation');

    jest.spyOn(validationModule.envValidationSchema, 'safeParse').mockReturnValue({
      error: new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          message: 'Root-level failure',
          path: [],
        },
        {
          code: z.ZodIssueCode.custom,
          message: '"MONGODB_URI" is required',
          path: ['MONGODB_URI'],
        },
      ]),
      success: false,
    });

    await expect(import('../env')).rejects.toThrow(
      /Invalid environment variables: \(root\): Root-level failure, MONGODB_URI: "MONGODB_URI" is required/,
    );
  });
});
