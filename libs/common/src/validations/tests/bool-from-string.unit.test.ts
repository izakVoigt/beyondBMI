import { faker } from '@faker-js/faker';

import { boolFromString } from '../bool-from-string';

describe('boolFromString', () => {
  it('should parse "true" (any casing) as true', () => {
    const candidates = ['true', 'TRUE', 'True', 'tRuE'];

    for (const value of candidates) {
      expect(boolFromString.parse(value)).toBe(true);
    }
  });

  it('should parse "false" (any casing) as false', () => {
    const candidates = ['false', 'FALSE', 'False', 'fAlSe'];

    for (const value of candidates) {
      expect(boolFromString.parse(value)).toBe(false);
    }
  });

  it('should reject any value other than "true" or "false"', () => {
    const invalidValues = new Set<string>();

    while (invalidValues.size < 25) {
      const value = faker.string.alpha({ length: { max: 12, min: 1 } });

      if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
        invalidValues.add(value);
      }
    }

    for (const value of invalidValues) {
      expect(() => boolFromString.parse(value)).toThrow();
    }
  });

  it('should reject non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => boolFromString.parse(123 as any)).toThrow();
  });
});
