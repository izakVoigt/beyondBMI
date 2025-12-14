import { availableSlotSchema } from '../available-slot';

describe('availableSlotSchema', () => {
  it('should pass with a valid Date object', () => {
    const now = new Date();
    const result = availableSlotSchema.safeParse({ slot: now });

    expect(result.success).toBe(true);
    expect(result.data?.slot).toEqual(now);
  });

  it('should fail if slot is missing', () => {
    const result = availableSlotSchema.safeParse({});

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['slot']);
  });

  it('should fail if slot is a string', () => {
    const result = availableSlotSchema.safeParse({ slot: '2025-01-01T12:00:00Z' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['slot']);
  });

  it('should fail if slot is an invalid Date', () => {
    const result = availableSlotSchema.safeParse({ slot: new Date('invalid') });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['slot']);
  });

  it('should fail if extra fields are present', () => {
    const result = availableSlotSchema.safeParse({ extra: true, slot: new Date() });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/unrecognized key/i);
  });
});
