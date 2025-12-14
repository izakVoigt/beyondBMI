import type { BaseDocument } from '../base-document';

import { faker } from '@faker-js/faker';
import { ZodError } from 'zod';

import { baseDocumentSchema } from '../base-document';

describe('baseDocumentSchema', () => {
  const createValidDocument = (): BaseDocument => ({
    _id: faker.database.mongodbObjectId(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  it('should parse a valid base document', () => {
    const doc = createValidDocument();

    const result = baseDocumentSchema.parse(doc);

    expect(result).toEqual(doc);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should reject when "_id" is not a string', () => {
    const doc = {
      ...createValidDocument(),
      _id: faker.number.int() as unknown as string,
    };

    expect(() => baseDocumentSchema.parse(doc)).toThrow(ZodError);
  });

  it('should reject when "_id" is not a valid ObjectId', () => {
    const doc = {
      ...createValidDocument(),
      _id: faker.string.alpha({ length: 24 }),
    };

    try {
      baseDocumentSchema.parse(doc);
    } catch (error) {
      const zodError = error as ZodError;

      expect(zodError.issues[0]?.path).toEqual(['_id']);
      expect(zodError.issues[0]?.message).toBe('"_id" must be a valid ObjectId');
    }
  });

  it('should reject when "createdAt" is not a Date', () => {
    const doc = {
      ...createValidDocument(),
      createdAt: faker.date.past().toISOString() as unknown as Date,
    };

    try {
      baseDocumentSchema.parse(doc);
    } catch (error) {
      const zodError = error as ZodError;

      expect(zodError.issues[0]?.path).toEqual(['createdAt']);
      expect(zodError.issues[0]?.message).toBe('"createdAt" must be a valid date');
    }
  });

  it('should reject when "updatedAt" is not a Date', () => {
    const doc = {
      ...createValidDocument(),
      updatedAt: faker.string.sample() as unknown as Date,
    };

    try {
      baseDocumentSchema.parse(doc);
    } catch (error) {
      const zodError = error as ZodError;

      expect(zodError.issues[0]?.path).toEqual(['updatedAt']);
      expect(zodError.issues[0]?.message).toBe('"updatedAt" must be a valid date');
    }
  });
});
