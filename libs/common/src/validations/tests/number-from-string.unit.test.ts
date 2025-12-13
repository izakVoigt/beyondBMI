import { faker } from '@faker-js/faker';

import { numberFromString } from '../number-from-string';

describe('numberFromString', () => {
  it('should parse a numeric string as a number', () => {
    const n = faker.number.int({ max: 1_000_000, min: -1_000_000 });
    const parsed = numberFromString.parse(String(n));

    expect(parsed).toBe(n);
    expect(typeof parsed).toBe('number');
  });

  it('should parse a decimal numeric string as a number', () => {
    const n = faker.number.float({ fractionDigits: 6, max: 10_000, min: -10_000 });
    const parsed = numberFromString.parse(String(n));

    expect(parsed).toBeCloseTo(n);
  });

  it('should reject NaN', () => {
    expect(() => numberFromString.parse('not-a-number')).toThrow('Must be a valid number');
  });

  it('should reject Infinity and -Infinity', () => {
    expect(() => numberFromString.parse('Infinity')).toThrow('Must be a valid number');
    expect(() => numberFromString.parse('-Infinity')).toThrow('Must be a valid number');
  });

  it('should reject non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => numberFromString.parse(42 as any)).toThrow();
  });
});
