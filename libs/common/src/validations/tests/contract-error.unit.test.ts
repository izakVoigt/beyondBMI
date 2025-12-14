import { faker } from '@faker-js/faker';

import { contractErrorSchema } from '../contract-error';

describe('contractErrorSchema', () => {
  it('should pass with a valid error message', () => {
    const result = contractErrorSchema.safeParse({
      message: faker.lorem.sentence(),
    });

    expect(result.success).toBe(true);
    expect(result.data?.message).toEqual(expect.any(String));
  });

  it('should fail if message is missing', () => {
    const result = contractErrorSchema.safeParse({});

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['message']);
    expect(result.error?.issues[0].message).toMatch(/must be a string/i);
  });

  it('should fail if message is not a string', () => {
    const result = contractErrorSchema.safeParse({
      message: 404,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/must be a string/i);
  });

  it('should fail if extra keys are present', () => {
    const result = contractErrorSchema.strict().safeParse({
      code: 'BAD_REQUEST',
      message: faker.lorem.sentence(),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/unrecognized key/i);
  });
});
