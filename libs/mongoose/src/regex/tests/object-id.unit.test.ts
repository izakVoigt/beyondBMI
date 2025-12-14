import { faker } from '@faker-js/faker';

import { objectIdRegex } from '../object-id';

describe('objectIdRegex', () => {
  it('should accept a valid MongoDB ObjectId', () => {
    const validObjectId = faker.database.mongodbObjectId();

    expect(objectIdRegex.test(validObjectId)).toBe(true);
  });

  it('should reject strings shorter than 24 characters', () => {
    const shortId = faker.string.hexadecimal({ length: 12 });

    expect(objectIdRegex.test(shortId)).toBe(false);
  });

  it('should reject strings longer than 24 characters', () => {
    const longId = faker.string.hexadecimal({ length: 32 });

    expect(objectIdRegex.test(longId)).toBe(false);
  });

  it('should reject non-hexadecimal characters', () => {
    const invalidId = faker.string.alpha({ length: 24 });

    expect(objectIdRegex.test(invalidId)).toBe(false);
  });

  it('should reject an empty string', () => {
    expect(objectIdRegex.test('')).toBe(false);
  });
});
