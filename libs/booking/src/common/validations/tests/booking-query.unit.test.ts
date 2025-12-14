import { faker } from '@faker-js/faker';
import { addDays } from 'date-fns';

import { bookingQuerySearchSchema } from '../booking-query';

describe('bookingQuerySearchSchema', () => {
  it('should pass with valid ISO date strings within 31 days', () => {
    const start = faker.date.future();
    const end = addDays(start, 10);

    const result = bookingQuerySearchSchema.safeParse({
      endDate: end.toISOString(),
      startDate: start.toISOString(),
    });

    expect(result.success).toBe(true);
  });

  it('should fail if startDate is after endDate', () => {
    const end = faker.date.future();
    const start = addDays(end, 5);

    const result = bookingQuerySearchSchema.safeParse({
      endDate: end.toISOString(),
      startDate: start.toISOString(),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['startDate']);
    expect(result.error?.issues[0].message).toMatch(/before or equal/i);
  });

  it('should fail if date range exceeds 31 days', () => {
    const start = faker.date.future();
    const end = addDays(start, 40);

    const result = bookingQuerySearchSchema.safeParse({
      endDate: end.toISOString(),
      startDate: start.toISOString(),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['endDate']);
    expect(result.error?.issues[0].message).toMatch(/cannot exceed 31 days/i);
  });

  it('should fail with invalid ISO strings', () => {
    const result = bookingQuerySearchSchema.safeParse({
      endDate: faker.string.uuid(),
      startDate: faker.lorem.word(),
    });

    expect(result.success).toBe(false);
    const messages = result.error?.issues.map(i => i.message);
    expect(messages).toContain('Invalid date');
    expect(messages).toContain('Invalid date');
  });

  it('should fail with missing fields', () => {
    const result = bookingQuerySearchSchema.safeParse({});

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ['startDate'] }),
        expect.objectContaining({ path: ['endDate'] }),
      ]),
    );
  });

  it('should fail with unknown keys', () => {
    const start = faker.date.future();
    const end = addDays(start, 5);

    const result = bookingQuerySearchSchema.safeParse({
      endDate: end.toISOString(),
      startDate: start.toISOString(),
      unknown: 'field',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/unrecognized key/i);
  });
});
